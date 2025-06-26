import React from "react";
import { Edit, Trash2 } from "lucide-react";
import AddIcon from "../../../../public/icons/add-icon.svg";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import UsersIcon from "../../../../public/icons/users-icon.svg";
import ChevronDown from "../../../../public/icons/chevron-down.svg";
import "./userspage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import SearchInput from "../../reusables/SearchInput/SearchInput";

const UsersPage: React.FC = () => {
  const users = [
    {
      id: 1,
      firstName: "Obi",
      lastName: "Francis",
      email: "obifrancis@gmail.com",
      role: "Admin",
      status: "Active",
      dateModified: "12-08-2024",
    },
    {
      id: 2,
      firstName: "Benita",
      lastName: "Eze",
      email: "benitaeze@gmail.com",
      role: "Officer",
      status: "Inactive",
      dateModified: "12-08-2024",
    },
    {
      id: 3,
      firstName: "Grace",
      lastName: "Benita",
      email: "grace@gmail.com",
      role: "Officer",
      status: "Active",
      dateModified: "12-08-2024",
    },
    {
      id: 4,
      firstName: "Matthew",
      lastName: "Scott",
      email: "mathew1@gmail.com",
      role: "Admin",
      status: "Inactive",
      dateModified: "12-08-2024",
    },
    {
      id: 5,
      firstName: "Scott",
      lastName: "Daniel",
      email: "scott20431@gmail.com",
      role: "Officer",
      status: "Active",
      dateModified: "12-08-2024",
    },
    {
      id: 6,
      firstName: "Samuel",
      lastName: "Daniel",
      email: "samuel9932@gmail.com",
      role: "Admin",
      status: "Active",
      dateModified: "12-08-2024",
    },
    {
      id: 7,
      firstName: "Daniel",
      lastName: "Scott",
      email: "danielscott128@gmail.com",
      role: "Officer",
      status: "Active",
      dateModified: "12-08-2024",
    },
    {
      id: 8,
      firstName: "Lolo",
      lastName: "Daniel",
      email: "lol0992@gmail.com",
      role: "Officer",
      status: "Inactive",
      dateModified: "12-08-2024",
    },
  ];

  const [selectedRole, setSelectedRole] = React.useState("");
  const [showAddUserForm, setShowAddUserForm] = React.useState(false);
  const [roleSelectFocused, setRoleSelectFocused] = React.useState(false);

  return (
    <div className="users-page">
      <div className="page-content">
        <div className="page-header">
          {!showAddUserForm ? (
            <PageTitle icon={UsersIcon} title="Users" />
          ) : (
            <PageTitle
              icon={UsersIcon}
              title="Users"
              breadcrumb={[
                { label: "Users", icon: UsersIcon },
                { label: "Add User" },
              ]}
              onBreadcrumbClick={(idx) => {
                if (idx === 0) setShowAddUserForm(false);
              }}
            />
          )}
        </div>

        {!showAddUserForm ? (
          <>
            <div className="page-header-bottom">
              <div style={{ display: "flex", gap: 24 }}>
                <SearchInput placeholder="Search name" />
                <SearchInput placeholder="Email address" />
                <SearchInput
                  placeholder="Role"
                  withDropdown
                  options={["Admin", "Officer"]}
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
              </div>
              <BorderButton
                text="Add New User"
                icon={AddIcon}
                onClick={() => setShowAddUserForm(true)}
              />
            </div>

            <div className="content-card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="table-header-item">S/N</th>
                      <th className="table-header-item">First Name</th>
                      <th className="table-header-item">Last Name</th>
                      <th className="table-header-item">Email</th>
                      <th className="table-header-item">Role</th>
                      <th className="table-header-item">Status</th>
                      <th className="table-header-item">Date Modified</th>
                      <th className="table-header-item">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user.id}>
                        <td className="table-data-item">{idx + 1}.</td>
                        <td className="table-data-item">{user.firstName}</td>
                        <td className="table-data-item">{user.lastName}</td>
                        <td className="table-data-item">{user.email}</td>
                        <td className="table-data-item-role">
                          <span className="role-badge-table">{user.role}</span>
                        </td>
                        <td className="table-data-item">
                          <span
                            className={`status-badge-table ${user.status.toLowerCase()}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="table-data-item">{user.dateModified}</td>
                        <td className="table-data-item">
                          <button className="action-btn-table edit">
                            <Edit size={16} /> Edit
                          </button>
                          <button className="action-btn-table delete">
                            <Trash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="add-user-form-card">
            <h2 className="add-user-title">Add User</h2>
            <p className="add-user-helper">
              Please input all required customer details to add a new user.
            </p>
            <form className="user-form-grid">
              <div className="form-row">
                <label>First Name</label>
                <input type="text" placeholder="" />
              </div>
              <div className="form-row">
                <label>Last Name</label>
                <input type="text" placeholder="" />
              </div>
              <div className="form-row">
                <label>Middle Name</label>
                <input type="text" placeholder="" />
              </div>
              <div className="form-row">
                <label>User Name</label>
                <input type="text" placeholder="" />
              </div>
              <div className="form-row">
                <label>Email Address</label>
                <input type="email" placeholder="" />
              </div>
              <div className="form-row">
                <label>Phone Number</label>
                <input type="text" placeholder="" />
              </div>
              <div className="form-row ">
                <label>Role</label>
                <div
                  className={`select-dropdown-wrapper${
                    roleSelectFocused ? " open" : ""
                  }`}
                >
                  <select
                    onFocus={() => setRoleSelectFocused(true)}
                    onBlur={() => setRoleSelectFocused(false)}
                  >
                    <option value="">Select role</option>
                    <option value="Admin">Admin</option>
                    <option value="Officer">Officer</option>
                  </select>
                  <img
                    src={ChevronDown}
                    alt="dropdown"
                    className="select-chevron"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn-full">
                  SAVE
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
