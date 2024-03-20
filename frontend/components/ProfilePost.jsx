import React, { useEffect, useState } from 'react';
import Modal from 'react-modal'

function ProfilePost({ post, profile, fetchPosts }) {
    const [likes, setLikes] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [deleteable, setDeleteable] = useState(false);
    const [profilePic, setProfilePic] = useState('');
    const [userLike, setUserLike] = useState(null);
    
    useEffect(() => {
        fetchLikes();
        fetchComments();
        fetchPosts()
    }, []);
    
    useEffect(() => {
        setDeleteable(post.profile_id === profile.id);
    }, [post, profile.id]);

    const fetchProfile = async () => {
        const response = await fetch(`/api/profiles/${post.profile_id}`);
        const data = await response.json();
        setProfilePic(data.profile_picture);
    };

    const fetchLikes = async () => {
        const response = await fetch(`/api/likes`);
        const data = await response.json();
        const profileLikes = data.filter(like => like.post_id === post.id);
        setLikes(profileLikes.length);
        const userLike = profileLikes.find(like => like.profile_id === profile.id);
        if (userLike) {
            setLiked(true);
            setUserLike(userLike);
        }
    };

    const fetchComments = async () => {
        const response = await fetch(`/api/comments`);
        const data = await response.json();
        const postComments = data.filter(comment => comment.post_id === post.id);
        setComments(postComments);
    };

    function handleLike() {
        fetchLikes();
        fetch(`/api/likes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profile_id: post.profile_id,
                post_id: post.id
            })
        })
        .then((response) => response.json())
        .then((data) => {
            setLikes(likes + 1);
            setLiked(true);
            setUserLike(data);
        })}


    function handleUnlike() {
        fetchLikes();
        if (userLike && userLike.profile_id === post.profile_id) {
            fetch(`/api/likes/${userLike.id}`, {
                method: 'DELETE',
            })
            .then((response) => response.json())
            .then((data) => {
                console.log('Unliked post');
                setLikes(likes - 1);
                setLiked(false);
                setUserLike(null);
            })
    } else {
        console.log('You can only delete your own likes')
    }}

    const handleOpenModal = () => {
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const handleNewCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    function handleNewCommentSubmit(event) {
        event.preventDefault();
        fetch(`/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: post.id,
                content: newComment,
                created_at: new Date().toISOString(),
                name: profile.name,
                profile_picture: profile.profile_picture
            })
        })
        .then((response) => response.json())
        .then((data) => {
            setComments([...comments, data]);
            setNewComment('');
        })
    }

    // const handleImageClick = () => {
    //     setShowModal(true);
    // };
    // const handleCloseModal = () => {
    //     setShowModal(false);
    // };

    const handleDeletePost = async () => {
        const response = await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE',
        });
    
        if (response.ok) {
            console.log('Post deleted successfully');
            fetchPosts();
        } else {
            console.error('Failed to delete post');
        }
    };

    const imageUrl = "http://localhost:5555/uploaded_images";

    const stickerPath = `${imageUrl}/${post.sticker}`

    const reformatPostDate = () => {
        const dateObject = new Date(post.created_at);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return dateObject.toLocaleDateString(undefined, options);
    }

    const reformatPostTime = () => {
        const dateObject = new Date(post.created_at);
        const options = { hour: 'numeric', minute: 'numeric' };
        return dateObject.toLocaleTimeString(undefined, options);
    }

    const reformatCommentDate = (comment) => {
        const dateObject = new Date(comment.created_at);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return dateObject.toLocaleDateString(undefined, options);
    }

    const reformatCommentTime = (comment) => {
        const dateObject = new Date(comment.created_at);
        const options = { hour: 'numeric', minute: 'numeric' };
        return dateObject.toLocaleTimeString(undefined, options);
    }

    return (
        <div className="profile-post-feed-display-item">
            {post.sticker ? 
            <img className="profile-post-pic" src={stickerPath} alt="pic_post" onClick={handleOpenModal}/> : null}
            <Modal isOpen={showModal} onRequestClose={handleCloseModal}>
                <div className="profile-post-header">
                    {deleteable ? <button className='delete-post-button' onClick={handleDeletePost}>X</button> : null}            
                    <h5>You posted this on {reformatPostDate()} at {reformatPostTime()}</h5>
                </div>
                <div className='profile-post-modal-image-comments'>
                    <div className="profile-image-like-wrapper">
                        {post.sticker ? 
                        <img className="profile-post-pic-modal" src={stickerPath} alt="profile-pic-post" /> : null}
                        {liked ? <button className='unlike-button' onClick={handleUnlike}><strong>{likes} {likes == 1 ? 'Like' : 'Likes'}</strong></button> : <button className='like-button' onClick={handleLike}>Like ♡</button>}
                        {liked ? <p>You liked this post.</p> : null}
                    </div>
                    <div className="profile-comments-container">
                        {comments.length === 0 ? (
                            <p>Be the first to comment on {post.name}'s post!</p>
                        ) : (
                            comments.map((comment, index) => (
                                <div key={index} className="profile-comment">
                                    <p>{comment.content}</p>
                                    <h5>{comment.name} on {reformatCommentDate(comment)} at {reformatCommentTime(comment)}</h5> 
                                    <p>----------------------</p>
                                </div>
                            ))
                        )}
                        <form onSubmit={handleNewCommentSubmit}>
                            <input type="text" value={newComment} onChange={handleNewCommentChange} placeholder="Write a comment..." />
                            <button type="submit">Post Comment</button>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ProfilePost;