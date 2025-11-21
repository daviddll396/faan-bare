import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  User as UserIcon,
  Mail,
  Building2,
  Shield,
  Save,
  Edit3,
} from "lucide-react";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import SolidButton from "../../reusables/SolidButton/SolidButton";
import Input from "../../reusables/Input/Input";
import "./profilepage.css";

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: user?.firstName || "John",
    lastName: user?.lastName || "Doe",
    email: user?.email || "john.doe@example.com",
    phone: "+234 800 123 4567",
    department: "Finance Department",
    jobTitle: "Senior Finance Manager",
    location: "Lagos, Nigeria",
    bio: "Experienced finance professional with over 8 years in the aviation industry.",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🔥 handleSave called - preventing defaults");

    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("🔥 Event defaults prevented");
    }

    try {
      console.log("🔥 Starting API call");

      // Only send phoneNumber and address as per backend requirements
      const updateData = {
        phoneNumber: formData.phone,
        address: formData.location,
      };

      console.log("🔥 Saving profile with data:", updateData);

      const result = await updateProfile(updateData);

      console.log("🔥 API call completed, result:", result);

      if (result && result.status) {
        console.log("🔥 Profile updated successfully:", result);
        setIsEditing(false);
        console.log("🔥 Edit mode disabled");
        // Show success message - you can add MessageToast here if needed
      } else {
        console.error("🔥 Failed to update profile:", result?.message);
        // Show error message - you can add MessageToast here if needed
      }
    } catch (error) {
      console.error("🔥 Error updating profile:", error);
      // Show error message - you can add MessageToast here if needed
    }

    console.log("🔥 handleSave completed");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔥 Form submit prevented");
  };

  return (
    <div className="profile-dashboard-root">
      <div className="page-header">
        <PageTitle title="Profile" subtitle="Manage your profile" />
      </div>
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <UserIcon className="profile-avatar-icon" color="var(--green)" />
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-name">
                {formData.firstName} {formData.lastName}
              </h1>
              <p className="profile-title">{formData.jobTitle}</p>
              <p className="profile-department">{formData.department}</p>
            </div>
          </div>
          <SolidButton
            className="profile-edit-toggle"
            onClick={() => setIsEditing(!isEditing)}
            icon={<Edit3 size={16} />}
            size="small"
            variant="secondary"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </SolidButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <form onSubmit={handleFormSubmit}>
        <div className="profile-content-grid">
          {/* Personal Information Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <UserIcon className="profile-card-icon" color="var(--green)" />
              <h3>Personal Information</h3>
            </div>
            <div className="profile-card-content">
              <div className="profile-field-group">
                {isEditing ? (
                  <Input
                    label="First Name"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                ) : (
                  <div className="profile-field">
                    <label>First Name</label>
                    <span>{formData.firstName}</span>
                  </div>
                )}
                {isEditing ? (
                  <Input
                    label="Last Name"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                ) : (
                  <div className="profile-field">
                    <label>Last Name</label>
                    <span>{formData.lastName}</span>
                  </div>
                )}
              </div>
              <div className="profile-field-group profile-field-group--single">
                {isEditing ? (
                  <textarea
                    className="profile-textarea"
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={3}
                  />
                ) : (
                  <div className="profile-field">
                    <label>Bio</label>
                    <span>{formData.bio}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <Mail className="profile-card-icon" color="var(--green)" />
              <h3>Contact Information</h3>
            </div>
            <div className="profile-card-content">
              <div className="profile-field-group profile-field-group--single">
                {isEditing ? (
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                ) : (
                  <div className="profile-field">
                    <label>Email Address</label>
                    <span>{formData.email}</span>
                  </div>
                )}
              </div>
              <div className="profile-field-group profile-field-group--single">
                {isEditing ? (
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                ) : (
                  <div className="profile-field">
                    <label>Phone Number</label>
                    <span>{formData.phone}</span>
                  </div>
                )}
              </div>
              <div className="profile-field-group profile-field-group--single">
                {isEditing ? (
                  <Input
                    label="Location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                  />
                ) : (
                  <div className="profile-field">
                    <label>Location</label>
                    <span>{formData.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Work Information Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <Building2 className="profile-card-icon" color="var(--green)" />
              <h3>Work Information</h3>
            </div>
            <div className="profile-card-content">
              <div className="profile-field-group">
                {isEditing ? (
                  <Input
                    label="Job Title"
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      handleInputChange("jobTitle", e.target.value)
                    }
                  />
                ) : (
                  <div className="profile-field">
                    <label>Job Title</label>
                    <span>{formData.jobTitle}</span>
                  </div>
                )}
                {isEditing ? (
                  <Input
                    label="Department"
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                  />
                ) : (
                  <div className="profile-field">
                    <label>Department</label>
                    <span>{formData.department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <Shield className="profile-card-icon" color="var(--green)" />
              <h3>Security Settings</h3>
            </div>
            <div className="profile-card-content">
              <div className="profile-security-item">
                <div className="security-item-info">
                  <span className="security-label">Password</span>
                  <span className="security-description">
                    Last changed 3 months ago
                  </span>
                </div>
                <SolidButton
                  onClick={() => {
                    /* placeholder */
                  }}
                  size="small"
                  variant="secondary"
                >
                  Change Password
                </SolidButton>
              </div>
              <div className="profile-security-item">
                <div className="security-item-info">
                  <span className="security-label">
                    Two-Factor Authentication
                  </span>
                  <span className="security-description">Not enabled</span>
                </div>
                <SolidButton
                  onClick={() => {
                    /* placeholder */
                  }}
                  size="small"
                  variant="secondary"
                >
                  Enable 2FA
                </SolidButton>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button for Edit Mode */}
        {isEditing && (
          <div className="profile-save-section">
            <SolidButton
              onClick={handleSave}
              icon={<Save size={16} />}
              size="medium"
              variant="primary"
              type="button"
            >
              Save Changes
            </SolidButton>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;
