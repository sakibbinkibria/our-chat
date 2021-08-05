import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, ThemeProvider, CircularProgress } from '@material-ui/core';
import '../App.css';
import Channel from './channel-component/channel';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import theme from '../theme';
import dataStore from '../store/data-store';

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCaWx1LPFWIOLmN8w35a3C5MBApuDF6hEQ",
  authDomain: "our-chat-b3c70.firebaseapp.com",
  projectId: "our-chat-b3c70",
  storageBucket: "our-chat-b3c70.appspot.com",
  messagingSenderId: "275539081064",
  appId: "1:275539081064:web:86da57f73ce63a97b388dd"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

function App() {
  const [user, setUser] = useState(() => firebase.auth().currentUser);
  const [initializing, setInitializing] = useState(true);
  const [docName, setDocName] = useState('commonRoom');
  const [memberIds, setMemberIds] = useState([]);
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setUser(user);
        dataStore.currentUser = user;

        const firestoreUser = {
          displayName: user.displayName,
          uid: user.uid,
          photoUrl: user.photoURl
        }
        db.collection('users').get().then((querySnapshot) => {
          let foundUser = null;
          foundUser = querySnapshot.docs.find((doc) => {
            const data = doc.data();
            return data.uid === firestoreUser.uid;
          })
          if (!foundUser) {
            db.collection('users').add(
              firestoreUser
            )
          } else {
            let userData = foundUser.data();
            if (userData.channels) {
              dataStore.channels = userData.channels;
              userData.channels.map(channel => {
                let channelName = '';
                channel.channelMemberNames.map((name) => {
                  if (name !== user.displayName) {
                    channelName = channelName.concat(name + ' ');
                  }
                })
                channel.channelName = channelName;
              })
            }
            dataStore.channels.push({
              docName: 'commonRoom',
              channelMemberNames: ['Common Room'],
              channelName: 'Common Room',
            })
          }
        });
        setAllUsers();
      } else {
        setUser(null);
      }
      if (initializing) {
        setInitializing(false);
      }
    })
    return unsubscribe;
  }, [])

  const createNewChat = (selectedMembers) => {
    if (selectedMembers.length > 0) {
      let chatMemberIds = [];
      let channelMemberNames = [];
      chatMemberIds.push(user.uid);
      channelMemberNames.push(user.displayName);
      selectedMembers.map((member, index) => {
        chatMemberIds.push(member.uid);
        channelMemberNames.push(member.displayName);
      })
      chatMemberIds.sort();
      let newDocName = '';
      chatMemberIds.forEach(id => {
        newDocName = newDocName.concat(id + '-');
      })
      let channelName = '';
      channelMemberNames.map((name) => {
        if (name !== user.displayName) {
          channelName = channelName.concat(name + ' ');
        }
      })
      dataStore.channels.push({
        docName: newDocName,
        channelMemberNames: channelMemberNames,
        channelName: channelName
      })

      var docRef = db.collection("chats").doc(newDocName);

      docRef.get().then((doc) => {
        docRef.collection('messages').add({
          text: 'Welcome',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        setMemberIds(newDocName.split('-'));
        setDocName(newDocName);
        // if (doc.exists()) {
        //   setDocName(newDocName);
        // } else {

        //   docRef.collection('messages').add({
        //     text: 'Welcome',
        //     createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        //   })
        //   setDocName(newDocName);
        // }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });

      db.collection('users').get().then((querySnapshot) => {
        let allMembers = selectedMembers;
        allMembers.push(user);
        allMembers.map((member) => {
          let foundUserDoc = null;
          foundUserDoc = querySnapshot.docs.find((doc) => {
            const data = doc.data();
            return data.uid === member.uid;
          })

          let foundUser = foundUserDoc.data();
          if (foundUser.channels) {
            let foundChannel = foundUser.channels.find(channel => {
              return channel.docName === newDocName
            })
            if (!foundChannel) {
              foundUser.channels.push({
                docName: newDocName,
                channelMemberNames: channelMemberNames
              })
              db.collection('users').doc(foundUserDoc.id).set(foundUser);
            }
          } else {
            foundUser.channels = [{
              docName: newDocName,
              channelMemberNames: channelMemberNames
            }]
            db.collection('users').doc(foundUserDoc.id).set(foundUser);
          }
        })

      });

    }
  }

  const switchToChannel = (channel) => {
    setMemberIds(channel.docName.split('-'));
    setDocName(channel.docName);
  }

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.error(error);
    }
  }

  const signOut = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.error(error);
    }
  }

  const setAllUsers = async () => {
    db.collection('users').get().then((querySnapshot) => {
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const foundUser = dataStore.allUsers.find((user) => {
          return user === data;
        })
        if (!foundUser) {
          dataStore.allUsers.push(data);
        }
      })
    });
  }

  if (initializing) {
    return (
      <div style={{ width: '100%', height: '99vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </div>
    )
  }
  return (
    user ?
      <ThemeProvider theme={theme}>
        <Channel key={docName} db={db} signOut={signOut} user={user} docName={docName} createNewChat={createNewChat} switchToChannel={switchToChannel} memberIds={memberIds} />
      </ThemeProvider> : (
        <ThemeProvider theme={theme}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: "center", alignItems: 'center', height: '100vh' }}>
            <Card className='cardClass'>
              <CardContent style={{ display: 'flex', flexDirection: 'column', justifyContent: "center", alignItems: 'center', backdropFilter: '10px' }}>
                <Typography variant='h2'>Our Chat</Typography>
                <Button onClick={signInWithGoogle} variant='contained' size='large' color='secondary' style={{ margin: '2em' }}>Sign In</Button>
              </CardContent>
            </Card>
          </div>
        </ThemeProvider>
      )

  );
}

export default App;
