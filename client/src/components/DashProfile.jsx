import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRef } from "react";
import { useState } from "react";
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import {
  updateUserFailure,
  updateUserSuccess,
  updateUserStart,
  deleteUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  signoutSuccess,
} from "../redux/user/userSlice";
import { Button ,Modal} from "flowbite-react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Bounce } from 'react-toastify';





const DashProfile = () => {
  const fileRef = useRef(null);
  const [image, setImage] = useState(undefined);
  const [imagePercent, setImagepercent] = useState(0);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [initialData, setInitialData] = useState({
    username: currentUser.username,
    email: currentUser.email,
  });
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    let isMounted = true; 
  
    const notify = () => {
      if (!isMounted) return; 
  
      if (updateSuccess) {
        toast.success('Details updated successfully', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
        return;
      }
      if (error) {
        toast.error(error.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      }
    };
  
    notify();
  
    return () => {
      isMounted = false; 
    };
  }, [updateSuccess, error]);

  useEffect(() => {
    setIsDisabled(
      formData.username === initialData.username &&
      formData.email === initialData.email &&
      formData.profilePicture === currentUser.profilePicture
    );
  }, [formData, initialData.username, initialData.email, currentUser.profilePicture]);

  useEffect(() => {
    if (image) {
      handleFileUpload(image);
    }
  }, [image]);
  const handleFileUpload = async (image) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagepercent(Math.round(progress));
      },
      (error) => {
        setImageError(true);
        setIsDisabled(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
        { setFormData((prevFormData) => ({ ...prevFormData, profilePicture: downloadURL }))
          setImageError(false);
      }
        );
      }
    );
  };
  const handleChange = (e) => {
    if (e.target.id === 'password' && e.target.value.trim() === '') {
      return;
    }
    setFormData({ ...formData, [e.target.id]: e.target.value });
    console.log(formData);
   
  };
  const handleSubmit = async (e) => {
    setIsDisabled(true);
    setUpdateSuccess(false);
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }); 
      const data = await res.json();
      console.log(data);
      if (data.success === false) {

        dispatch(updateUserFailure(new Error(data.message || "Update failed")));
           
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error));
      
      console.log(error);
    }
   
  };
  const handleDeleteAccount = async (e) => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error));
    }
  };
  const handleSignout = async () => {
    try {
      const res = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
      
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <motion.div className="transition-all duration-1000  p-4 max-w-lg mx-auto w-full" 
    initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}>
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <img
          src={formData.profilePicture || currentUser.profilePicture}
          alt="profile"
          className="h-24 w-24 self-center cursor-pointer rounded-full object-cover mt-2"
          onClick={() => fileRef.current.click()}
        />
        <p className="text-sm self-center">
          {imageError ? (
            <span className="text-red-700">
              Error Uploading image ( File size must be less than 2 MB )
            </span>
          ) : imagePercent > 0 && imagePercent < 100 ? (
            <span className="text-slate-700">{`Uploading:${imagePercent}%`}</span>
          ) : imagePercent === 100 && !imageError ? (
            <span className="text-green-700">Image uploaded successfully</span>
          ) : (
            ""
          )}
        </p>
        <input
          defaultValue={currentUser.username}
          type="text"
          id="username"
          placeholder="Username"
          className="bg-slate-100 dark:bg-slate-300 dark:text-slate-700 rounded-lg p-3"
          onChange={handleChange}
          
        />
        <input
          defaultValue={currentUser.email}
          type="email"
          id="email"
          placeholder="Email"
          className="bg-slate-100 dark:bg-slate-300 dark:text-slate-700 rounded-lg p-3"
          onChange={handleChange}
          required
        />
        <input
        defaultValue={currentUser.password}
          type="password"
          id="password"
          placeholder="Password"
          className="bg-slate-100  dark:bg-slate-300 dark:text-slate-700 rounded-lg p-3"
          onChange={handleChange}
          
        />
        <Button
          className="p-1 uppercase"
          type="submit"
          gradientDuoTone="purpleToBlue"
          outline
          disabled={isDisabled}
        
        >
          {loading ? "loading..." : "update"}
        </Button>
        {currentUser.isAdmin && (
          <Link to={"/create"}>
            <Button
              type="button"
              gradientDuoTone="purpleToPink"
              className="w-full"
            >
              Create Event
            </Button>
          </Link>
        )}
      </form>
      <div className="flex text-red-500 justify-between mt-5">
        <span  onClick={() => setShowModal(true)} className=" cursor-pointer">
          Delete Account
        </span>
        <span onClick={handleSignout} className=" cursor-pointer">
          Sign out
        </span>
      </div>
     
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Are you sure you want to delete your account?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeleteAccount}>
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <ToastContainer
position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="dark"
transition={Bounce}
/>

<ToastContainer />
    </motion.div>
    
  );
};

export default DashProfile;