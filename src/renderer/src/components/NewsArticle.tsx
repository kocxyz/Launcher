import { Box, Divider, Typography } from '@mui/material'

function NewsArticle({
  title,
  date,
  content
}: {
  title: string
  date: string
  content: string
}): JSX.Element {
  return (
    <Box
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography
        style={{
          fontSize: '18px',
          fontFamily: 'Brda',
          fontStyle: 'italic',
          letterSpacing: '1.5px'
        }}
      >
        {title}
      </Typography>
      <Typography
        style={{ fontSize: '12px', color: 'grey', fontFamily: 'Azbuka', fontWeight: 'bold' }}
      >
        {date}
      </Typography>
      <Typography style={{ fontSize: '14px', fontFamily: 'Azbuka' }}>{content}</Typography>
      <Divider style={{ marginTop: '10px' }} />
    </Box>
  )
}

export default NewsArticle
