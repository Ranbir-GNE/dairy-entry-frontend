import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

const DiaryApp = () => {
  const [currentUser, setCurrentUser] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getUserFromToken = async () => {
    const token = localStorage.getItem("key");
    try {
      const response = await axios.get(
        "https://diary-entry-backend.vercel.app/api/auth/get-user",
        {
          headers: { Authorization: `${token}` },
        }
      );
      setCurrentUser(response.data.username || "Unknown");
      console.log(response.data._id);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEntries = async () => {
    const token = localStorage.getItem("key");
    try {
      const response = await axios.get(
        "https://diary-entry-backend.vercel.app/api/diary",
        {
          headers: { Authorization: `${token}` },
        }
      );
      setEntries(response.data);
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEntries();
    getUserFromToken();
  }, []);

  const handleAddEntry = async () => {
    const token = localStorage.getItem("key");
    if (!newEntry.title || !newEntry.description) {
      toast.warning("Title and Description are required.");
      return;
    }

    try {
      const response = await axios.post(
        "https://diary-entry-backend.vercel.app/api/diary/",
        { title: newEntry.title, description: newEntry.description },
        { headers: { Authorization: `${token}` } }
      );
      setEntries([...entries, response.data]);
      setNewEntry({ title: "", description: "" });
      toast.success("New diary entry added!");
    } catch (err) {
      toast.error("Failed to add new entry.");
      console.log(err);
    }
  };

  const handleEditEntry = async (id) => {
    const token = localStorage.getItem("key");
    if (!selectedEntry.title || !selectedEntry.description) {
      toast.warning("Title and Description are required.");
      return;
    }

    try {
      const response = await axios.put(
        `https://diary-entry-backend.vercel.app/api/diary/${id}`,
        { title: selectedEntry.title, description: selectedEntry.description },
        { headers: { Authorization: `${token}` } }
      );
      setEntries(
        entries.map((entry) => (entry._id === id ? response.data : entry))
      );
      setIsEditing(false);
      toast.success("Entry updated successfully!");
    } catch (err) {
      toast.error("Failed to update entry.");
      console.log(err);
    }
  };

  const handleDeleteEntry = async (id) => {
    const token = localStorage.getItem("key");
    try {
      await axios.delete(
        `https://diary-entry-backend.vercel.app/api/diary/${id}`,
        {
          headers: { Authorization: `${token}` },
        }
      );
      setEntries(entries.filter((entry) => entry._id !== id));
      setSelectedEntry(null);
      toast.success("Entry deleted!");
    } catch (err) {
      toast.error("Failed to delete entry.");
      console.log(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("key");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Daily Diary</h1>
        <input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex p-2 border rounded mr-4 text-black w-1/3"
        />
        <div className="flex items-center">
          <span className="mr-4 text-lg font-semibold">{currentUser}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-grow">
        {/* Left Sidebar: Entries List */}
        <div className="w-1/3 bg-white p-4 shadow-lg space-y-4">
          <button
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            Add New Entry
          </button>

          <ul className="space-y-2">
            {entries
              .filter((entry) =>
                entry.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((entry) => (
                <li
                  key={entry._id}
                  className={`p-4 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors ${
                    selectedEntry?._id === entry._id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <h2 className="text-lg font-bold">{entry.title}</h2>
                  <p className="text-sm text-gray-500">
                    {format(new Date(entry.createdAt), "dd/MM/yyyy")}
                  </p>
                </li>
              ))}
          </ul>
        </div>

        {/* Right: Entry Details */}
        <div className="w-2/3 p-6 bg-gray-50 rounded-lg shadow-md">
          {selectedEntry ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedEntry.title}</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(selectedEntry._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Created on:{" "}
                {format(new Date(selectedEntry.createdAt), "dd/MM/yyyy")}
              </p>

              {isEditing ? (
                <div className="mt-4 space-y-4">
                  <input
                    type="text"
                    value={selectedEntry.title}
                    onChange={(e) =>
                      setSelectedEntry({
                        ...selectedEntry,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    value={selectedEntry.description}
                    onChange={(e) =>
                      setSelectedEntry({
                        ...selectedEntry,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={() => handleEditEntry(selectedEntry._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <p className="mt-4">{selectedEntry.description}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select an entry to view details</p>
          )}
        </div>
      </div>

      {/* Add Diary Lightbox */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-1/2 shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Add New Entry</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddEntry();
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Title"
                value={newEntry.title}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, title: e.target.value })
                }
                className="w-full p-3 border rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={newEntry.description}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, description: e.target.value })
                }
                className="w-full p-3 border rounded-lg"
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryApp;
