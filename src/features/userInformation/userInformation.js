import { useState, useEffect } from 'react'
import { FaEdit, FaSave, FaTimes, FaTrash, FaPlus } from "react-icons/fa"
import axios from 'axios'
import "./UserInformation.css"

function UserInformation() {
    const [users, setUsers] = useState([]);
    const [Password, setPassword] = useState("");
    const [editingUserId, setEditingUserId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        username: "",
        password: "",
        roles: [],
    });
    const [newUserData, setNewUserData] = useState({
        username: "",
        password: "",
        roles: []
    });
    const [showCreateForm, setShowCreateForm] = useState(false);

    const rolesOptions = ["Admin", "Manager", "Employee", "Guest"]; // Define possible roles


    const fetchUsers = () => {
        axios
            .get(process.env.REACT_APP_URI + "/users")
            .then((res) => {
                setUsers(res.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the user data!", error);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        setNewUserData({
            ...newUserData,
            [name]: value
        });
    };

    const handleEditClick = (user) => {
        setEditingUserId(user._id);
        setEditFormData({
            username: user.username,
            password: "",
            roles: Array.isArray(user.roles) ? user.roles : [], // Ensure roles is an array
        });
    };
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setEditFormData({
            ...editFormData,
            [name]: value,
        });
    };

    const handleRoleToggle = (role) => {
        setNewUserData((prevData) => {
            const updatedRoles = [...prevData.roles];
            if (updatedRoles.includes(role)) {
                return { ...prevData, roles: updatedRoles.filter((r) => r !== role) };
            } else {
                return { ...prevData, roles: [...updatedRoles, role] };
            }
        });
    };

    const handleCreateUser = () => {
        if (!newUserData.username || !newUserData.password) {
            alert("Username and password are required.");
            return;
        }

        axios
            .post(process.env.REACT_APP_URI + "/users", newUserData)
            .then((res) => {
                setUsers((prevUsers) => [...prevUsers, res.data]);
                setShowCreateForm(false);
                setNewUserData({ username: "", password: "", roles: [] });
            })
            .catch((error) => {
                console.error("Error creating user", error);
            });
    };

    const handleRoleChange = (role) => {
        setEditFormData((prevData) => {
            // Create a new array to avoid direct mutation
            const updatedRoles = [...prevData.roles];
            
            if (updatedRoles.includes(role)) {
                // If role already exists, remove it
                return {
                    ...prevData,
                    roles: updatedRoles.filter((r) => r !== role),
                };
            } else {
                // If role does not exist, add it
                return {
                    ...prevData,
                    roles: [...updatedRoles, role],
                };
            }
        });
    };
    

    const handleSaveClick = (userId) => {
        const updatedUserData = {
            ...editFormData,
            roles: [...editFormData.roles], // Ensure roles is an array
            active: users.find((user) => user._id === userId).active, // Keep current active status
        };
        console.log("Updated User Info: ", updatedUserData)
        axios
            .patch(`${process.env.REACT_APP_URI}/users/${userId}`, updatedUserData)
            .then(() => {
                setUsers(users.map(user => user._id === userId ? { ...user, ...updatedUserData } : user));
                setEditingUserId(null); // Exit edit mode
            })
            .catch((error) => {
                console.error("Error saving user data", error);
            });
    };
    

    const handleToggleActive = (userId) => {
        const updatedUser = users.find(user => user._id === userId);
        const newStatus = !updatedUser.active;

        const updatedUserData = {
            ...updatedUser,
            active: newStatus,
        };

        axios
            .patch(`${process.env.REACT_APP_URI}/users/${userId}`, updatedUserData)
            .then(() => {
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, active: newStatus } : user
                ));
            })
            .catch((error) => {
                console.error("Error updating user status", error);
            });
    };

    const handleDelete = (userId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    
        if (confirmDelete) {
          axios
            .delete(process.env.REACT_APP_URI + "/users/" + userId)
            .then((res) => {
              console.log("user deleted successfully:", res.data)
              // Update the state to remove the deleted tenant
              setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId))
            })
            .catch((error) => {
              console.error("There was an error deleting the user!", error)
            });
        }
    };

    const handleCancel = () => {
        setEditingUserId(null) // Exit edit mode
        setEditFormData({}) // Reset edited tenant data
      };

    return (
        <>
            {/* <div>userInformation</div> */}
            <div className="userinformation-table-container">
                <button onClick={() => setShowCreateForm(true)} className="add-user-button">
                    <FaPlus /> Add New User
                </button>
                {showCreateForm && (
                    <div className="popup-overlay">
                        <div className="popup-form">
                            <h3>Create New User</h3>
                            <input
                                type="text"
                                placeholder="Enter Username"
                                name="username"
                                value={newUserData.username}
                                onChange={handleNewUserChange}
                            />
                            <input
                                type="password"
                                placeholder="Enter Password"
                                name="password"
                                value={newUserData.password}
                                onChange={handleNewUserChange}
                            />
                            <div className="roles-container">
                                {rolesOptions.map((role) => (
                                    <label key={role}>
                                        <input
                                            type="checkbox"
                                            checked={newUserData.roles.includes(role)}
                                            onChange={() => handleRoleToggle(role)}
                                        />
                                        {role}
                                    </label>
                                ))}
                            </div>
                            <div className="popup-buttons">
                                <button onClick={() => setShowCreateForm(false)} className="cancel-button">
                                    Cancel
                                </button>
                                <button onClick={handleCreateUser} className="save-button">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Password</th>
                            <th>Roles</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    {editingUserId === user._id ? (
                                        <input
                                            type="text"
                                            name="username"
                                            value={editFormData.username}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        user.username
                                    )}
                                </td>
                                <td>
                                    {editingUserId === user._id ? (
                                        <input
                                            type="text"
                                            name="password"
                                            // value={editFormData.password}
                                            value={editFormData.password}
                                            autoComplete='off'
                                            placeholder='Enter a Password or Re-enter Password'
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        "•".repeat(18) // Display black dots when not in edit mode
                                    )}
                                </td>
                                <td>
                                    {editingUserId === user._id ? (
                                        rolesOptions.map((role) => (
                                            <label key={role}>
                                                <input
                                                    className='checkboxes'
                                                    type="checkbox"
                                                    checked={editFormData.roles.includes(role)}
                                                    onChange={() => handleRoleChange(role)}
                                                />
                                                {role}
                                            </label>
                                        ))
                                    ) : (
                                        user.roles.join(", ")
                                    )}
                                </td>
                                <td>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={user.active}
                                            onChange={() => handleToggleActive(user._id)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </td>
                                <td>
                                    <div className="co-vm-buttons">
                                        {editingUserId === user._id ? (
                                            <button
                                                className="save-button"
                                                onClick={() => handleSaveClick(user._id)}
                                            >
                                                <FaSave />
                                            </button>
                                        ) : (
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                <FaEdit />
                                            </button>
                                        )}
                                        {editingUserId === user._id ? (
                                            <button
                                            className="delete-button"
                                            onClick={() => handleCancel()}
                                        >
                                            <FaTrash />
                                        </button>
                                        ) : (
                                            <button
                                            className="delete-button"
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            <FaTrash />
                                        </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default UserInformation;