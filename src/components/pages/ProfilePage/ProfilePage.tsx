import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import PageTitle from "../../reusables/PageTitle/PageTitle";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building2,
  Shield,
  Key,
  Bell,
  Save,
  Edit3,
} from "lucide-react";
import "./profilepage.css";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
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

  const handleSave = () => {
    // Here you would typically save to backend
    setIsEditing(false);
  };

  return (
    <div className="profile-dashboard-root">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <UserIcon size={60} color="#007948" />
            </div>
            <div className="profile-basic-info">
              <h1 className="profile-name">
                {formData.firstName} {formData.lastName}
              </h1>
              <p className="profile-title">{formData.jobTitle}</p>
              <p className="profile-department">{formData.department}</p>
            </div>
          </div>
          <button
            className="profile-edit-toggle"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={16} />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="profile-content-grid">
        {/* Personal Information Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <UserIcon size={20} color="#007948" />
            <h3>Personal Information</h3>
          </div>
          <div className="profile-card-content">
            <div className="profile-field-group">
              <div className="profile-field">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                ) : (
                  <span>{formData.firstName}</span>
                )}
              </div>
              <div className="profile-field">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                ) : (
                  <span>{formData.lastName}</span>
                )}
              </div>
            </div>
            <div className="profile-field">
              <label>Bio</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={3}
                />
              ) : (
                <span>{formData.bio}</span>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <Mail size={20} color="#007948" />
            <h3>Contact Information</h3>
          </div>
          <div className="profile-card-content">
            <div className="profile-field">
              <label>Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              ) : (
                <span>{formData.email}</span>
              )}
            </div>
            <div className="profile-field">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              ) : (
                <span>{formData.phone}</span>
              )}
            </div>
            <div className="profile-field">
              <label>Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                />
              ) : (
                <span>{formData.location}</span>
              )}
            </div>
          </div>
        </div>

        {/* Work Information Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <Building2 size={20} color="#007948" />
            <h3>Work Information</h3>
          </div>
          <div className="profile-card-content">
            <div className="profile-field">
              <label>Job Title</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    handleInputChange("jobTitle", e.target.value)
                  }
                />
              ) : (
                <span>{formData.jobTitle}</span>
              )}
            </div>
            <div className="profile-field">
              <label>Department</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                />
              ) : (
                <span>{formData.department}</span>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <Shield size={20} color="#007948" />
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
              <button className="profile-btn-secondary">Change Password</button>
            </div>
            <div className="profile-security-item">
              <div className="security-item-info">
                <span className="security-label">
                  Two-Factor Authentication
                </span>
                <span className="security-description">Not enabled</span>
              </div>
              <button className="profile-btn-secondary">Enable 2FA</button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button for Edit Mode */}
      {isEditing && (
        <div className="profile-save-section">
          <button className="profile-save-btn" onClick={handleSave}>
            <Save size={16} />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
