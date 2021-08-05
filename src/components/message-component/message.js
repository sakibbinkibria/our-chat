import React , {useState, useEffect} from 'react';
import { Avatar } from '@material-ui/core/esm';
import { Typography } from '@material-ui/core';
import dataStore from '../../store/data-store';
import './message-styles.css';

const Message = ({
    text = '',
    createdAt = null,
    displayName = '',
    photoURL = '',
    uid = null,
}) =>{
    if (!text) return null;

  return (
    <div style={{ display:'flex', flexDirection:'column'}}>
      <Typography variant='caption' color='textSecondary' style={{marginLeft: uid === dataStore.currentUser.uid? 'auto' : '0'}}>{displayName}</Typography>
      <div style={{ display:'flex', flexDirection:'row', alignItems:'center'}}>
        {photoURL ? (
          <Avatar
            src={photoURL}
            alt="Avatar"
            style = {{marginLeft: uid === dataStore.currentUser.uid? 'auto' : '0'}}
          />
        ) : null}
        <div className={uid === dataStore.currentUser.uid ? 'sentMessageBox' : 'receivedMessageBox'}>
          <Typography>{text}</Typography>
        </div>
      </div>
      <div style = {{marginLeft: uid === dataStore.currentUser.uid ? 'auto' : '0'}}>
          {createdAt? createdAt.seconds ? (
            <Typography variant='caption'>
              {new Date(createdAt.seconds * 1000).toDateString()+' at '+new Date(createdAt.seconds * 1000).getHours()+' : '+new Date(createdAt.seconds * 1000).getMinutes()}
            </Typography>
          ) : null : null}
      </div>
    </div>
  );
}

export default Message;