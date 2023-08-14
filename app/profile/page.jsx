"use client"

import { useEffect, useState } from "react"
import Profile from "@components/Profile"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const MyProfile = () => {

  const router = useRouter();

    const {data: session} = useSession();

    const [posts, setPosts] = useState([])

    useEffect(() => {
        const fetchPosts = async () => {
          const response = await fetch(`/api/users/${session?.user.id}/posts`);
          const data = await response.json();
    
          if(session?.user.id) setPosts(data)
        }
    
        fetchPosts();

      }, []);

      const handleEdit = (post) => {
        router.push(`/update-prompt?id=${post._id}`)
      }
  
      const handleDelete = async (post) => {
        const hasConfirmed = confirm("Are you sure you want to delete this prompt?")

        if(hasConfirmed) {
          try{
            await fetch(`/api/prompt/${post._id.toString()}`,{
              method: "DELETE"
            });

            const filteredPosts = posts.filter((p) => 
              p._id !== post._id);

              setPosts(filteredPosts)

          } catch(error){
            console.log(error)
          }
        }
  
      }

  return (
    <Profile
      name="my"
      desc="Welcome to your personalized profile page"
      data={posts}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
    />
  )
}

export default MyProfile 

























