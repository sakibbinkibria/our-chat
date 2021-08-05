import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Button, ThemeProvider, Avatar, TextField, FormControl, Divider, Dialog, InputLabel, Select, Input, Chip, MenuProps, MenuItem, DialogContent, } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Icon from '@material-ui/icons/Send';
import MenuIcon from '@material-ui/icons/Menu';
import PlusIcon from '@material-ui/icons/AddCircle';
import firebase from 'firebase';
import dataStore from '../../store/data-store';
import 'firebase/auth';
import 'firebase/firestore';
import './channel-styles.css'

import Message from '../message-component/message';

const Channel = ({ db = null, signOut = null, user = null, docName = null, createNewChat = null, switchToChannel=null, memberIds=null }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newMember, setNewMember] = useState();
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { uid, displayName, photoURL } = user;

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current ?.scrollIntoView({ behavior: "smooth" })
    }


    useEffect(() => {
        scrollToBottom();
        if (db && docName) {
            const docRef = db.collection("chats").doc(docName);
            const unsubscribe = docRef.collection('messages').orderBy('createdAt').limit(100)
                .onSnapshot(querySnapshot => {
                    const data = querySnapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id,
                    }));
                    setMessages(data);
                    scrollToBottom();
                });
            return unsubscribe;
        }
        document.getElementById('largeAvatar').style.height = document.getElementById('largeAvatar') ?.offsetWidth;
    }, [db]);

    const openLeftSidebar = () => {
        if (document.getElementById('leftSideBar').style.display && document.getElementById('leftSideBar').style.display === 'none') {
            document.getElementById('leftSideBar').style.display = 'flex'
        } else {
            document.getElementById('leftSideBar').style.display = 'none'
        }
    }

    const openRightSidebar = () => {
        if (document.getElementById('rightSideBar').style.display && document.getElementById('rightSideBar').style.display === 'none') {
            document.getElementById('rightSideBar').style.display = 'flex'
        } else {
            document.getElementById('rightSideBar').style.display = 'none'
        }
    }

    const handleChange = (event) => {
        setNewMessage(event.target.value);
    }

    const openNewChatDialog = () => {
        setOpenDialog(true);
    }

    const closeNewChatDialog = () => {
        setOpenDialog(false);
        setSelectedMembers([]);
        setNewMember('');
    }

    const handleSelectChange = (event, value) => {

        if (value && typeof value !== 'string') {
            let currentMemers = selectedMembers;
            currentMemers.push(value);
            setSelectedMembers(currentMemers);
        } else {
            setNewMember(value);
        }

        // setNewMember(value);
        // let currentMemers = selectedMembers;
        // currentMemers.push(newMember);
        // setSelectedMembers(currentMemers);
    }

    const createChat = () => {
        closeNewChatDialog();
        createNewChat(selectedMembers);

    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (db) {
            // db.collection('messages').add({
            //     text: newMessage,
            //     createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            //     uid,
            //     displayName,
            //     photoURL
            // })
            var docRef = db.collection("chats").doc(docName);

            docRef.collection('messages').add({
                text: newMessage,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                uid,
                displayName,
                photoURL
            })
        }

        setNewMessage('');
    }

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <div className='header'>
                <MenuIcon className='menuIcon' onClick={openLeftSidebar} style={{zIndex:200}}/>
                <Typography variant='h4'>OURCHAT</Typography>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {photoURL ? (
                        <Avatar
                            src={photoURL}
                            alt="Avatar"
                            style={{ margin: '0px 5px' }}
                            onClick={openRightSidebar}
                        />
                    ) : null}
                    {displayName ? (
                        <Typography variant='h5' style={{ marginRight: '2em', marginLeft: '5px' }} className='headerUserName'>{displayName}</Typography>
                    ) : null}
                    <Button className='headerSignOutButton' style={{ minWidth: '5%', margin: '0px 5px' }} color='secondary' onClick={signOut} variant='contained'>Sign Out</Button>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', width: "100%", height: '93%', position: 'absolute' }}>
                {/* style={{backgroundImage: `url(${process.env.PUBLIC_URL}'/bg-texture.jpg')`, backdropFilter:'blur(30px)'}} */}
                <div className='leftContainer' style={{alignItems:'center'}} id='leftSideBar'>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', overflowY:'auto'}}>
                    {
                        dataStore.channels.map((channel) => {
                            return (
                                <div className='channelBox' onClick={()=>switchToChannel(channel)}>
                                    <Avatar style={{ marginRight: '10px', backgroundColor: '#DE7A22' }}>{channel.channelName.charAt(0)}</Avatar>
                                    <Typography variant='h6'>{channel.channelName}</Typography>
                                </div>
                            )
                        })
                    }
                </div>

                    <PlusIcon onClick={openNewChatDialog} color='secondary' style={{width:'50px', height:'50px'}}/>
                </div>

                <div className='middleContainer'>
                    <div className='chatContainer'>
                        {
                            messages.map(msg => {
                                return (
                                    <div style={{ marginLeft: 'auto' }}><Message {...msg} /><br /></div>
                                )
                            })
                        }
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className='inputSection' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <TextField
                                maxRows={4}
                                value={newMessage}
                                onChange={handleChange}
                                placeholder="Type message..."
                                variant='filled'
                                style={{ backgroundColor: '#cef0dc', margin: '1em', minWidth: '20%', borderRadius: '5px' }}
                            />
                            <Button
                                variant="contained"
                                endIcon={<Icon />}
                                onClick={handleSubmit}
                                style={{ borderRadius: '5px' }}
                                color='secondary'
                            >
                                Send
                            </Button>
                        </div>
                    </form>
                </div>

                <div className='rightContainer' id='rightSideBar'>
                    <Card className='userListCard'>
                        <Avatar id='largeAvatar' style={{ backgroundColor: '#DE7A22', margin: '1em', width: '80px', height: '80px' }}>C</Avatar>
                        {
                            dataStore.channels.map(channel=>{
                                if(channel.docName === docName){
                                    return (
                                        <Typography variant='h5'>{channel.channelName}</Typography>
                                    )
                                }
                            })
                        }

                        <Typography style={{ marginRight: 'auto', marginTop: '10px' }}>Participants:</Typography>
                        <div style={{display:'flex', flexDirection:'column', alignItems:'center', overflowY:'auto'}}>
                        {
                            dataStore.allUsers.map((user) => {
                            if(docName === 'commonRoom' || memberIds.includes(user.uid)){
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '10px 0px', justifyContent: 'center', marginRight: 'auto' }}>
                                        {user.photoUrl ? (
                                            <Avatar
                                                src={user.photoUrl}
                                            />
                                        ) : null}
                                        <Typography style={{ marginLeft: '5px' }}>{user.displayName}</Typography>
                                    </div>
                                )
                            }
                        })}
                        </div>
                    </Card>
                    <Button className='sidebarSignOutButton' style={{ minWidth: '5%', margin: '0px 5px' }} color='secondary' onClick={signOut} variant='contained'>Sign Out</Button>
                </div>
            </div>

            {/*New Chat Dialog*/}
            <Dialog open={openDialog} onClose={closeNewChatDialog}>
                <DialogContent style={{ padding: '1em', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {selectedMembers && selectedMembers.length > 0 &&
                            selectedMembers.map((member) => {
                                return <Chip avatar={<Avatar src={member.photoURL} />} label={member.displayName} />
                            })
                        }
                    </div>
                    <FormControl>
                        <Autocomplete
                            options={dataStore.allUsers.map(user => { return { uid: user.uid, displayName: user.displayName, photoUrl: user.photoUrl } })}
                            getOptionLabel={(option) => option.displayName}
                            inputMode='search'
                            inputValue={newMember}
                            renderOption={option =>
                                <MenuItem key={option.uid} value={option.displayName}>
                                    <Avatar src={option.photoUrl} /> {option.displayName}
                                </MenuItem>
                            }
                            onInputChange={(event, value, option) => { handleSelectChange(event, value) }}
                            onChange={(event, value) => { handleSelectChange(event, value) }}
                            freeSolo
                            renderInput={(params) => <TextField style={{ margin: 0, minWidth: '250px' }} {...params} margin="normal" variant='filled' label='Select Memebers' />}
                        />

                        {selectedMembers && selectedMembers.length > 0 &&
                            <Button onClick={createChat}>Create Chat</Button>
                        }

                    </FormControl>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Channel