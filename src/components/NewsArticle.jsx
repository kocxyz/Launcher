import { Box, Divider, Typography } from '@mui/material'
import React from 'react'

function NewsArticle(props) {
  return (
    <Box style={{ 
        width: '100%', 
        display: 'flex',
        flexDirection: 'column',
    }}>
        <Typography style={{ fontSize: '18px', fontFamily: 'Brda', fontStyle: 'italic', letterSpacing: '1.5px' }}>{props.title}</Typography>
        <Typography style={{ fontSize: '12px', color: 'grey', fontFamily: 'Azbuka', fontWeight: 'bold' }}>{props.date}</Typography>
        <Typography style={{  fontSize: '14px', fontFamily: 'Azbuka' }}>{props.content}</Typography>
        <Divider style={{ marginTop: '10px' }} />
    </Box>
  )
}

export default NewsArticle