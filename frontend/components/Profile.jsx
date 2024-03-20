import React, { useEffect, useState } from 'react';
import ProfilePost from './ProfilePost.jsx';
import { useNavigate } from 'react-router-dom';
import './app.css';

function Profile({ profile }) {
  const [posts, setPosts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [profile]);

  const fetchPosts = async () => {
    const response = await fetch('/api/posts');
    const data = await response.json();
    setPosts(data);
    console.log(posts)
  };
  
  if (!profile) {
    return <div>Loading...</div>;
  }

  const travelNewPost = () => {
    navigate('/new-post');
  };

  const reformatBirthday = (birthday) => {
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
  <div>
    <div className='profile-background'></div>
    <div className="profile-container">
      <h2 className="profile-title">{profile.name}</h2>
      <div className="profile-content">
        <img className="profile-avatar" src={profile.profile_picture} alt="user avatar" />
        <p className="profile-username">Username: {profile.username}</p>
        <p className='profile-birthday'>Born on {reformatBirthday(profile.birthday)}</p>
        <p className="profile-email">Email Address: {profile.email}</p>
        <p className="profile-bio">{profile.description}</p>
        <h3>Click on an image to view your post!</h3>
        <div className='profile-posts-container'>
        {posts.length == 0 ?
          <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginTop: '20px', textAlign: 'center'}}>
              <h3>Create your first post with the button at the bottom right of your screen!</h3>
              <img className='dog-silly' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdmjQ0OCscE5badyvtZfShqdMIMFMw8_wAvg&s'/>
          </div>
        :
        posts.filter(post => post.profile_id === profile.id).map(post => (
          <ProfilePost key={post.id} post={post} profile={profile} fetchPosts={fetchPosts}/>
        ))}
        </div>
      </div>
      <button className="floating-button" onClick={travelNewPost}>New Post</button>
  </div>
  </div>
  );
}

export default Profile;