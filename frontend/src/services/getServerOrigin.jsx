const getServerOrigin = () => {
  const env = import.meta.env.VITE_ENV; 
   if(env=='/dev'){
    return 'http://localhost:3000';
   } else {
    return 'https://beyond-chats-ruby.vercel.app';
   }
};

export default getServerOrigin;