import { Box, Typography } from '@mui/material'

function NewsArticle({
  title,
  date,
  content
}: {
  title: string
  date: string
  content: string
}) {
  return (
    <Box
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 15px',
        marginBottom: '15px',
        transition: '0.3s',
      }}
    >
      <Box>
        <Typography
          style={{
            fontSize: '22px',
            fontFamily: 'Brda',
            fontStyle: 'italic',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#FFF000'
          }}
        >
          {title}
        </Typography>
        <Typography
          style={{ fontSize: '12px', color: '#aaaaaa', fontFamily: 'Loew', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}
        >
          {date}
        </Typography>
        <Typography style={{ fontSize: '15px', fontFamily: 'Azbuka', color: '#e0e0e0', lineHeight: '1.4' }}>
          <div className='news-content' dangerouslySetInnerHTML={{ __html: content }} />
        </Typography>
      </Box>
    </Box>
  )
}

export default NewsArticle
