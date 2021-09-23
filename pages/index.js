// Main entry point of your app
import React, {useState, useEffect} from "react"
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import StreamerGrid from '../components/StreamerGrid'



const Home = () => {
  //
  const [favoriteChannel, setFavoriteChannel]=useState([])
  useEffect(()=>{
    console.log("Fetching channels...")
    fetchChannels()
  },[])



  const fetchChannels = async () =>{
    try{
      const path = `https://${window.location.hostname}`
      //Get keys form DB
      const response = await fetch(`${path}/api/database`,{
        method:'POST',
        body: JSON.stringify({
          action: 'GET_CHANNELS',
          key: 'CHANNELS'
        })
      })
      if (response.status === 404){
        console.log('channels key could not be found')
      }
      const json = await response.json()
      if (json.data){
        const channelNames = json.data.split(',')
        console.log('CHANNEl NAMES:', channelNames)
        const channelData =[]
        for await(const channelName of channelNames){
        console.log("Getting Twitch Data for:", channelName)
        const channelResp = await fetch(`${path}/api/twitch`,{
          method: 'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({data: channelName})
        })
        const json = await channelResp.json()
        if(json.data){
          channelData.push(json.data)
          console.log(channelData)
        }
      }
      setFavoriteChannel(channelData)
      }

    }catch(error){
      console.warn(error.message)
    }

}

  const addStreamer= async event=>{
    //Prevent the page from redirecting
    event.preventDefault()
    
    const { value } = event.target.elements.name
    if(value){
      const path = `https://${window.location.hostname}`
      const response = await fetch(`${path}/api/twitch`,{
        method: 'POST',
        headers:{
          'Content-Type':'application/json'
          },
        body:JSON.stringify({data: value})
      })
      const json = await response.json()
      console.log("From server:", json.data)
      setFavoriteChannel(prevState=>[...prevState, json.data])
      await setChannel(value)
      event.target.elements.name.value =""
    }
    
  }


  const setChannel = async channelName => {
    try{
      const currentStreamers = favoriteChannel.map(channel=> channel.display_name.toLowerCase())
      const streamerList = [...currentStreamers, channelName].join(",")
      const path = `https://${window.location.hostname}`
      const response = await fetch(`${path}/api/database`,{
        method:'POST',
        body: JSON.stringify({
          key: 'CHANNELS',
          value:streamerList
        })
      })
      console.log(response)
      if (response.status === 200){
        console.log(`Set ${channelName} in DB.`)
      }

    }catch(error){
      console.warn(error.message)
      console.log("error")

    }
  }

  const renderForm=()=>(
    <div className={styles.formContainer}>
    <form onSubmit={addStreamer}>
    <input id="name" placeholder="Twitch channel name" type="text" required/>
    <button type="submit"> Add streamer </button>
    </form>
    </div>

  )
  return (
    <div className={styles.container}>
      <Head>
        <title>🎥 Personal Twitch Dashboard</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={styles.inputContainer}>
        {renderForm()}
        <StreamerGrid channels ={favoriteChannel} setChannels={setFavoriteChannel}/>
      </div>
    </div>
  )
}

export default Home