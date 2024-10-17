import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import LoadingButton from "./LoadingButton";

const DiaryApp = () => {
  const [currentUser, setCurrentUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    description: "",
    media: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState([]);

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
      let imageUrls = [];

      // Upload multiple images to Cloudinary if selected
      if (selectedImage.length > 0) {
        for (const image of selectedImage) {
          const formData = new FormData();
          formData.append("file", image);
          formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);

          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/upload`,
            formData
          );
          if (!response) {
            toast.error("Failed to upload image(s).");
            return;
          }

          imageUrls.push(response.data.secure_url); // Collect all image URLs
        }
      }

      // Submit new diary entry with image URLs to the backend
      const diaryResponse = await axios.post(
        "https://diary-entry-backend.vercel.app/api/diary/",
        {
          title: newEntry.title,
          description: newEntry.description,
          media: imageUrls, // Send array of media URLs
        },
        { headers: { Authorization: `${token}` } }
      );

      setEntries([...entries, diaryResponse.data]);
      setNewEntry({ title: "", description: "" });
      setSelectedImage([]); // Reset selected images
      toast.success("New diary entry added!");
      setIsLoading(false);
    } catch (err) {
      toast.error("Failed to add new entry.");
      console.log(err);
      setIsLoading(false);
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); // Get all selected files
    const fileReaders = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage((prev) => [...prev, reader.result]); // Store multiple images
      };
      reader.readAsDataURL(file);
    });
  };

  const openImageInNewTab = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold md:text-3xl">Daily Diary</h1>
        <input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex p-2 border rounded mr-4 text-black w-1/2 md:w-1/3 lg:w-1/4"
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
        <div className="md:w-1/3 bg-white p-2 md:p-3 shadow-lg space-y-4">
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
                  className={`p-2 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors ${
                    selectedEntry?._id === entry._id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <h2 className="text-lg font-bold md:text-xl">
                    {entry.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {format(new Date(entry.createdAt), "dd/MM/yyyy")}
                  </p>
                </li>
              ))}
          </ul>
        </div>

        <div className="w-full md:w-2/3 p-2 md:p-3 bg-gray-50 shadow-md">
          {selectedEntry ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold">
                  {selectedEntry.title}
                </h2>
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(selectedEntry._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
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
                    rows="4"
                  />
                  <LoadingButton
                    onClick={() => handleEditEntry(selectedEntry._id)}
                  />
                </div>
              ) : (
                <div>
                  <p className="mt-4">{selectedEntry.description}</p>
                  {selectedEntry.media.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {selectedEntry.media.map((url) => (
                        <div
                          key={url}
                          className="cursor-pointer"
                          onClick={() => openImageInNewTab(url)}
                        >
                          <img
                            src={url}
                            alt="Diary media"
                            className="rounded-lg shadow-md"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Select an entry to view details</p>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
            <h2 className="text-xl font-bold mb-4">Add New Entry</h2>
            <input
              type="text"
              placeholder="Title"
              value={newEntry.title}
              onChange={(e) =>
                setNewEntry({ ...newEntry, title: e.target.value })
              }
              className="w-full p-2 border rounded mb-4"
            />
            <textarea
              placeholder="Description"
              value={newEntry.description}
              onChange={(e) =>
                setNewEntry({ ...newEntry, description: e.target.value })
              }
              className="w-full p-2 border rounded mb-4"
              rows="4"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mb-4"
            />
            <LoadingButton
              onClick={handleAddEntry}
              isLoading={isLoading}
              buttonText="Add Entry"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="mt-2 text-red-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryApp;
