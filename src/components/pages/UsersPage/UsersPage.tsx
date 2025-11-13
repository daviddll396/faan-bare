import React from "react";
import { Edit, Trash2 } from "lucide-react";
import AddIcon from "/icons/add-icon.svg";
import FieldButton from "../../reusables/FieldButton/FieldButton";
import SolidButton from "../../reusables/SolidButton/SolidButton";
import GradientButton from "../../reusables/GradientButton/GradientButton";
// Card wrapper removed for modal-based add/edit UX
import Input from "../../reusables/Input/Input";
import UsersIcon from "/icons/users-icon.svg";
import { useLoading } from "../../../contexts/LoadingContext";
import ConfirmationModal from "../../reusables/ConfirmationModal/ConfirmationModal";
import "./userspage.css";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import Modal from "../../reusables/Modal/Modal";
import SlideIndicator from "../../reusables/SlideIndicator/SlideIndicator";
import DataTable from "../../reusables/DataTable/DataTable";
import ListBox, { type ListBoxOption } from "../../reusables/ListBox/ListBox";

// Add User type for local state
interface LocalUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  dateModified: string;
}

interface UsersPageProps {
  role?: string;
}

const UsersPage: React.FC<UsersPageProps> = () => {
  const { showLoading, hideLoading } = useLoading();

  const initialUsers: LocalUser[] = [
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

  // User management state
  const [allUsers, setAllUsers] = React.useState<LocalUser[]>(initialUsers);
  const [editingUser, setEditingUser] = React.useState<LocalUser | null>(null);

  // Search state
  const [searchName, setSearchName] = React.useState("");
  const [searchEmail, setSearchEmail] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<ListBoxOption | null>(
    null
  );
  const [filteredUsers, setFilteredUsers] = React.useState(allUsers);

  // Role options for ListBox
  const roleOptions: ListBoxOption[] = [
    { id: "admin", name: "Admin", value: "Admin" },
    { id: "officer", name: "Officer", value: "Officer" },
  ];

  // UI state
  const [showAddUserForm, setShowAddUserForm] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Confirmation modal state
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<LocalUser | null>(
    null
  );

  // Form state
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    middleName: "",
    userName: "",
    email: "",
    phone: "",
    role: "",
  });

  // Helper function to get current date
  const getCurrentDate = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${now.getFullYear()}`;
  };

  // Search function
  const handleSearch = React.useCallback(() => {
    let filtered = allUsers;

    // Filter by name (firstName or lastName)
    if (searchName.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchName.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by email
    if (searchEmail.trim()) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole.value);
    }

    setFilteredUsers(filtered);
  }, [allUsers, searchName, searchEmail, selectedRole]);

  // Update filtered users when dependencies change
  React.useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // Clear search filters
  const handleClearSearch = () => {
    setSearchName("");
    setSearchEmail("");
    setSelectedRole(null);
    setFilteredUsers(allUsers);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showLoading(editingUser ? "Updating user..." : "Creating new user...");

    setTimeout(() => {
      const currentDate = getCurrentDate();

      if (editingUser) {
        // Update existing user
        const updatedUsers = allUsers.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: formData.role,
                dateModified: currentDate,
              }
            : user
        );
        setAllUsers(updatedUsers);
        setEditingUser(null);
      } else {
        // Add new user
        const newUser = {
          id: Math.max(...allUsers.map((u) => u.id)) + 1,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          status: "Active",
          dateModified: currentDate,
        };
        setAllUsers((prev) => [...prev, newUser]);
      }

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        middleName: "",
        userName: "",
        email: "",
        phone: "",
        role: "",
      });

      hideLoading();
      setShowAddUserForm(false);
    }, 2000);
  };

  // Handle edit action
  const handleEdit = (user: LocalUser) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: "",
      userName: "",
      email: user.email,
      phone: "",
      role: user.role,
    });
    setShowAddUserForm(true);
  };

  // Handle delete action - show confirmation modal
  const handleDelete = (user: LocalUser) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (userToDelete) {
      showLoading("Deleting user...");
      setTimeout(() => {
        setAllUsers((prev) =>
          prev.filter((user) => user.id !== userToDelete.id)
        );
        hideLoading();
        setShowDeleteConfirmation(false);
        setUserToDelete(null);
      }, 1500);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setUserToDelete(null);
  };

  // Reset form when switching to add mode
  const handleAddNewUser = () => {
    setEditingUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      middleName: "",
      userName: "",
      email: "",
      phone: "",
      role: "",
    });
    setShowAddUserForm(true);
  };

  return (
    <div className="users-page">
      <div className="page-content">
        <div className="page-header">
          <PageTitle
            icon={UsersIcon}
            title="Users"
            subtitle={
              "Find users by name, email, or role. Use the filters below to narrow down your search."
            }
          />
        </div>

        <>
          <div className="page-header-bottom">
            <div className="userspage-search-section">
              <div className="userspage-search-row">
                <div className="userspage-search-left">
                  <FieldButton
                    inputs={[
                      {
                        placeholder: "Search by name",
                        value: searchName,
                        onChange: (e) => setSearchName(e.target.value),
                      },
                      {
                        placeholder: "Search by email",
                        value: searchEmail,
                        onChange: (e) => setSearchEmail(e.target.value),
                      },
                    ]}
                    buttons={[
                      { text: "Search", onClick: handleSearch },
                      { text: "Clear", onClick: handleClearSearch },
                    ]}
                    className="userspage-search-fieldbutton"
                  />
                  {windowWidth > 860 && (
                    <div className="userspage-role-wrap">
                      <ListBox
                        options={roleOptions}
                        selected={selectedRole}
                        onChange={setSelectedRole}
                        placeholder="All Roles"
                        className="userspage-role-listbox"
                      />
                    </div>
                  )}
                </div>

                <div className="userspage-search-right">
                  <div className="userspage-add-action">
                    <SolidButton
                      text="Add New User"
                      onClick={handleAddNewUser}
                      icon={<img src={AddIcon} alt="Add" />}
                      variant="secondary"
                      size="medium"
                      className="userspage-add-fieldbutton"
                    />
                  </div>
                </div>
              </div>

              <DataTable
                headers={[
                  "S/N",
                  "First Name",
                  "Last Name",
                  "Email",
                  "Role",
                  "Status",
                  "Date Modified",
                  "Actions",
                ]}
                data={filteredUsers.map((user, idx) => [
                  `${idx + 1}.`,
                  user.firstName,
                  user.lastName,
                  user.email,
                  <span key={`r-${user.id}`} className="role-badge-table">
                    {user.role}
                  </span>,
                  <span
                    key={`s-${user.id}`}
                    className={`status-badge ${
                      user.status.toLowerCase() === "inactive"
                        ? "failed"
                        : "completed"
                    }`}
                  >
                    {user.status}
                  </span>,
                  user.dateModified,
                  <div key={`a-${user.id}`}>
                    <button
                      className="action-btn-table edit"
                      style={{ marginRight: "5px" }}
                      onClick={() => handleEdit(user)}
                    >
                      <Edit size={16} />
                      {/* Edit */}
                    </button>
                    <button
                      className="action-btn-table delete"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 size={16} />
                      {/* Delete */}
                    </button>
                  </div>,
                ])}
                className="users-admin-table"
              />
            </div>
          </div>
          {windowWidth <= 768 && <SlideIndicator />}
        </>

        {showAddUserForm && (
          <Modal
            isOpen={showAddUserForm}
            onClose={() => setShowAddUserForm(false)}
            showHeader={true}
            showLogo={false}
            headerTitle={editingUser ? "Edit User" : "Add User"}
            className="add-user-modal"
          >
            <div className="add-user-modal-body">
              <div className="modal-form-header">
                <p className="modal-form-helper">
                  {editingUser
                    ? "Please update the user details."
                    : "Please input all required customer details to add a new user."}
                </p>
              </div>
              <form className="user-form-grid" onSubmit={handleFormSubmit}>
                <div className="form-row-pair">
                  <Input
                    label="First Name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />

                  <Input
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-row-pair">
                  <Input
                    label="Middle Name"
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                  />

                  <Input
                    label="User Name"
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-row-pair">
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />

                  <Input
                    label="Phone Number"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <ListBox
                  options={roleOptions}
                  selected={
                    roleOptions.find((o) => o.value === formData.role) ?? null
                  }
                  onChange={(opt) =>
                    setFormData((prev) => ({ ...prev, role: opt.value }))
                  }
                  placeholder="Select role"
                />

                <div className="form-actions">
                  <GradientButton type="submit" fullWidth>
                    {editingUser ? "UPDATE" : "SAVE"}
                  </GradientButton>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete User"
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.firstName} ${userToDelete.lastName}? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </div>
  );
};

export default UsersPage;
