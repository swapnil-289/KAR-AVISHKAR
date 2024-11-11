import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { Alert, Button, Label,Spinner} from "flowbite-react";
import { motion } from 'framer-motion';
export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.username || !formData.email || !formData.password)
    {
      return setErrorMessage('Please fill out all the fields');
    
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      setLoading(false);
      if (data.success === false) {
        
        return setErrorMessage(data.message);
      }
setLoading(false);
if(res.ok)
{
 
  navigate("/sign-in");
}


      
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
      
    }
  };
  return (
    <motion.div className="transition-all duration-1000 min-h-screen mt-20"
    initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}>
      <div className="flex flex-col md:flex-row p-3 max-w-3xl mx-auto md:items-center gap-5">
        <div className="flex-1">
          <Link to="/" className="bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              Event
            </span>
            Management
          </Link>
          <p className="text-sm mt-5">
          Welcome To The Event Management App. You can sign up with your username, email
            and password or with Google
          </p>
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <Label className="mb-1" value="Your username " />
              <input
             type='text'
             placeholder='Username'
             id='username'
             onChange={handleChange}
             className=" dark:bg-slate-900 dark:text-slate-400  rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-1" value="Your email"></Label>
              <input
               type='email'
               placeholder='name@company.com'
               id='email'
               onChange={handleChange}
                className=" dark:bg-slate-900 dark:text-slate-400  rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-1" value="Your password" />
              <input
                type='password'
                placeholder='Password'
                id='password'
                onChange={handleChange}
                className=" dark:bg-slate-900 dark:text-slate-400  rounded-md mb-6"
              />
            </div>

            <Button
              gradientDuoTone="purpleToPink"
              disabled={loading}
              type="submit"
              className=" text-white p-2 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
            >
              {loading ? (
             <> <Spinner size='sm'/>
              <span className='pl-3'>Loading...</span>
              </> ): "Sign Up"}
            </Button>
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <p>Have an account?</p>
            <Link to="/sign-in">
              <span className="text-blue-500">Sign in</span>
            </Link>
          </div>
          {errorMessage && (
  <Alert className="mt-5" color='failure'>
    {errorMessage}
  </Alert>
)}
         
        </div>
      </div>
    </motion.div>
  );
}
