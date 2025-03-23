import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false);
    const [image, setImage] = useState(false);
    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext);

    const updateUserProfileData = async () => {
        try {
            const formData = new FormData();
            formData.append("name", userData.name);
            formData.append("phone", userData.phone);
            formData.append("address", JSON.stringify(userData.address));
            formData.append("gender", userData.gender);
            formData.append("dob", userData.dob);
            formData.append("isPregnant", userData.pregnancyDetails.isPregnant);
            formData.append("currentMonth", userData.pregnancyDetails.currentMonth);
            formData.append("age", userData.pregnancyDetails.age ? Number(userData.pregnancyDetails.age) : "");
            formData.append("expectedDeliveryDate", userData.pregnancyDetails.expectedDeliveryDate);
            formData.append("complications", userData.pregnancyDetails.complications);

            image && formData.append("image", image);

            const { data } = await axios.post(backendUrl + "/api/user/update-profile", formData, { headers: { token } });

            if (data.success) {
                toast.success(data.message);
                await loadUserProfileData();
                setIsEdit(false);
                setImage(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return userData ? (
        <div className="max-w-lg flex flex-col gap-2 text-sm pt-5">
            {isEdit ? (
                <label htmlFor="image">
                    <div className="inline-block relative cursor-pointer">
                        <img className="w-36 rounded opacity-75" src={image ? URL.createObjectURL(image) : userData.image} alt="" />
                        <img className="w-10 absolute bottom-12 right-12" src={image ? "" : assets.upload_icon} alt="" />
                    </div>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                </label>
            ) : (
                <img className="w-36 rounded" src={userData.image} alt="" />
            )}

            {isEdit ? (
                <input className="bg-gray-50 text-3xl font-medium max-w-60" type="text" onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))} value={userData.name} />
            ) : (
                <p className="font-medium text-3xl text-[#262626] mt-4">{userData.name}</p>
            )}

            <hr className="bg-[#ADADAD] h-[1px] border-none" />

            {/* Contact Information */}
            <div>
                <p className="text-gray-600 underline mt-3">CONTACT INFORMATION</p>
                <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]">
                    <p className="font-medium">Email id:</p>
                    <p className="text-blue-500">{userData.email}</p>
                    <p className="font-medium">Phone:</p>

                    {isEdit ? (
                        <input className="bg-gray-50 max-w-52" type="text" onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))} value={userData.phone} />
                    ) : (
                        <p className="text-blue-500">{userData.phone}</p>
                    )}

                    <p className="font-medium">Address:</p>

                    {isEdit ? (
                        <p>
                            <input className="bg-gray-50" type="text" onChange={(e) => setUserData((prev) => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={userData.address.line1} />
                            <br />
                            <input className="bg-gray-50" type="text" onChange={(e) => setUserData((prev) => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={userData.address.line2} />
                        </p>
                    ) : (
                        <p className="text-gray-500">{userData.address.line1} <br /> {userData.address.line2}</p>
                    )}
                </div>
            </div>

            {/* Pregnancy Details */}
            <div>
                <p className="text-[#797979] underline mt-3">PREGNANCY DETAILS</p>
                <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600">
                    <p className="font-medium">Are you pregnant?</p>
                    {isEdit ? (
                        <select className="bg-gray-50" onChange={(e) => setUserData((prev) => ({ ...prev, pregnancyDetails: { ...prev.pregnancyDetails, isPregnant: e.target.value === "Yes" } }))} value={userData.pregnancyDetails.isPregnant ? "Yes" : "No"}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    ) : (
                        <p className="text-gray-500">{userData.pregnancyDetails.isPregnant ? "Yes" : "No"}</p>
                    )}

                    <p className="font-medium">Current Pregnancy Month:</p>
                    {isEdit ? <input className="bg-gray-50 max-w-20" type="number" min="1" max="9" onChange={(e) => setUserData((prev) => ({ ...prev, pregnancyDetails: { ...prev.pregnancyDetails, currentMonth: e.target.value } }))} value={userData.pregnancyDetails.currentMonth} /> : <p className="text-gray-500">{userData.pregnancyDetails.currentMonth}</p>}

                    <p className="font-medium">Expected Delivery Date:</p>
                    {isEdit ? <input className="bg-gray-50 max-w-28" type="date" onChange={(e) => setUserData((prev) => ({ ...prev, pregnancyDetails: { ...prev.pregnancyDetails, expectedDeliveryDate: e.target.value } }))} value={userData.pregnancyDetails.expectedDeliveryDate} /> : <p className="text-gray-500">{userData.pregnancyDetails.expectedDeliveryDate}</p>}
                </div>
            </div>

            <div className="mt-10">
                {isEdit ? <button onClick={updateUserProfileData} className="border border-primary px-8 py-2 rounded-full">Save</button> : <button onClick={() => setIsEdit(true)} className="border border-primary px-8 py-2 rounded-full">Edit</button>}
            </div>
        </div>
    ) : null;
};

export default MyProfile;