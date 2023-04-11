import { Box, Divider, Typography } from '@mui/material'
import React from 'react'

function NewsArticle(props) {
  return (
    <Box style={{ 
        width: '100%', 
        display: 'flex',
        flexDirection: 'column',
    }}>
        <Typography style={{ fontSize: '18px' }}>{props.title}</Typography>
        <Typography style={{ fontSize: '12px', color: 'grey' }}>{props.date}</Typography>
        <Typography style={{  fontSize: '12px' }}>{props.content}</Typography>
        <Divider style={{ marginTop: '10px' }} />
    </Box>
  )
}

export default NewsArticle