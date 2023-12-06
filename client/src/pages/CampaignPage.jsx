import { useEffect, useState } from "react";
import DownloadCSVButton from "../components/DownLoadCSVButton";
import ModalForm from "../components/ModalForm";
import {
  createCampaignFormField,
  editCampaignFormField,
} from "../utils/campaignForm";
import "../assets/scss/pages/CampainPage.scss";
import Pagination from "../components/Pagination";
import DeleteModal from "../components/DeleteModal";
import api from "../api/axios";
import { toast } from "react-toastify";

const initState = {
  resData: {
    current_page: "",
    data: [],
    first_page_url: "",
    from: 0,
    last_page: 0,
    last_page_url: null,
    links: [],
    next_page_url: null,
    path: null,
    per_page: 0,
    prev_page_url: null,
    to: 0,
    total: 0,
  },
  current_page: 1,
  currentCampaign: {},
  localEditCampaignFormField: [...editCampaignFormField],
};

const CampaignPage = () => {
  const [pageState, setPageState] = useState(initState);
  const [formState, setFormState] = useState({
    create: false,
    edit: false,
    delete: false,
  });

  useEffect(() => {
    fetchCampaign();
  }, [pageState.current_page]);

  const fetchCampaign = async () => {
    try {
      const res = await api.get(
        `api/campaign/get?page=${pageState.current_page}`
      );
      handleChange("resData", res.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/");
        toast.error(error.response.data.message);
      } else {
        console.error(error);
      }
    }
  };

  const handleChange = (name, value) => {
    setPageState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleOpenForm = (name) => {
    setFormState({ ...formState, [name]: true });
  };

  const handleCloseForm = (name) => {
    setFormState({ ...formState, [name]: false });
  };

  const handleOpenEditForm = (data) => {
    handleChange("currentCampaign", data);
    handleChange(
      "localEditCampaignFormField",
      pageState.localEditCampaignFormField.map((group) => {
        if (group.section_title === "Creative") {
          return {
            ...group,
            contents: group.contents.map((content) => {
              if (content.name in data.creatives[0]) {
                return { ...content, default: data.creatives[0][content.name] };
              }
              return content;
            }),
          };
        } else {
          return {
            ...group,
            contents: group.contents.map((content) => {
              if (content.name in data) {
                return { ...content, default: data[content.name] };
              }
              return content;
            }),
          };
        }
      })
    );
    handleOpenForm("edit");
  };

  const handleOpenDeleteForm = (data) => {
    handleChange("currentCampaign", data);
    handleOpenForm("delete");
  };

  const handleSearchChange = async (e) => {};

  const handleCreateCampaign = async (data) => {
    let formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));

    try {
      const res = await api.post("api/campaign/create", formData);
      toast.success(res.data.message);
      handleCloseForm("create");
      fetchCampaign();
    } catch (error) {
      throw error;
    }
  };

  const handleEditCampaign = async (data) => {
    let formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    try {
      const res = await api.post(`api/campaign/update/${data.id}`, formData);
      toast.success(res.data.message);
      handleCloseForm("edit");
      fetchCampaign();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      const res = await api.get(
        `api/campaign/delete/${pageState.currentCampaign.id}`
      );
      toast.success(res.data.message);
      handleCloseForm("delete");
      fetchCampaign();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="page-container">
      <ModalForm
        setVisible={() => handleCloseForm("create")}
        visible={formState.create}
        title={"Create Campaign"}
        customFunction={handleCreateCampaign}
        formField={createCampaignFormField}
      />

      <ModalForm
        setVisible={() => handleCloseForm("edit")}
        visible={formState.edit}
        title={"Edit Campaign"}
        customFunction={handleEditCampaign}
        formField={pageState.localEditCampaignFormField}
        defaultFormValue={pageState.currentCampaign}
      />
      <DeleteModal
        setVisible={() => handleCloseForm("delete")}
        visible={formState.delete}
        title={"Confirmation"}
        customFunction={handleDeleteCampaign}
        message={"Please confirm that you want to delete the campaign"}
      />
      <div className="filter-bar">
        <label>Start time:</label>
        <input type="datetime-local" name="start_date" />
        <label>End time:</label>
        <input type="datetime-local" name="end_date" />
      </div>
      <div className="control-bar">
        <div className="left-control">
          <input
            type="text"
            placeholder="Search ..."
            onChange={handleSearchChange}
          />
        </div>
        <div className="right-control">
          <DownloadCSVButton />
          <button type="button" onClick={() => handleOpenForm("create")}>
            Create Campaign
          </button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Used Amount</th>
              <th>Usage Rate</th>
              <th>Budget</th>
              <th>Start date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageState.resData.data.map((campaign, index) => {
              return (
                <tr key={index}>
                  <td>
                    <div className="double-item-cell">
                      <div className="img-container">
                        {campaign.creatives.length > 0 && (
                          <img
                            src={campaign.creatives[0].preview_image}
                            alt=""
                          />
                        )}
                      </div>
                      {campaign.campaign_name}
                    </div>
                  </td>
                  <td>
                    {campaign.status === 1 ? (
                      <i
                        className="fa-solid fa-circle-dot fa-2xs"
                        style={{ color: "greenyellow" }}
                      ></i>
                    ) : (
                      <i
                        className="fa-solid fa-circle-dot fa-2xs"
                        style={{ color: "red" }}
                      ></i>
                    )}
                  </td>
                  <td>¥ {campaign.used_amount}</td>
                  <td>{campaign.usage_rate}%</td>
                  <td>¥ {campaign.budget}</td>
                  <td>{campaign.start_date}</td>
                  <td>{campaign.end_date}</td>
                  <td className="no-wrap">
                    <button
                      className="edit-btn"
                      type="button"
                      onClick={() => handleOpenEditForm(campaign)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      type="button"
                      onClick={() => handleOpenDeleteForm(campaign)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        totalPages={pageState.resData.last_page}
        setPage={handleChange}
        current_page={pageState.resData.current_page}
      />
    </div>
  );
};

export default CampaignPage;
