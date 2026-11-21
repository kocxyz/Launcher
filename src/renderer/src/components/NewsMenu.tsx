import { Box, CircularProgress } from '@mui/material'
import { memo, useEffect, useState } from 'react'
import moment from 'moment'

// Components
import NewsArticle from './NewsArticle'

const farewellpost = `Hey everyone<br>
<br>
Most of you probably haven't heard from me here, in a long time. Unfortunately I'm not here to bring good news :(<br>
<br>
Between wanting to focus on other projects and the community not being the same as it once was, as hard as it is to say, <strong>I think it's time to sunset kocity.xyz.</strong><br>
I do want to clarify, though, that this decision <strong>only refers to the kocity.xyz authentication system and the launcher</strong>. If the individual Server Hoster providing game servers want to continue providing those, you'll have to get in contact with them and join their respective communities.<br>
<br>
The actual shutdown is scheduled to happen on <strong>December 20th 2026</strong>, to give everyone plenty of time to move their stuff over to new systems, if they so desire.<br>
And if any of the aforementioned server hosters need data previously managed by xyz, please reach out to me and I'll provide you with whatever you need.<br>
<br>
Personally I've always believed that all good things must come to an end, and this doesn't change here. I think its better to let something survive as good memories rather than dragging something out for unnecessarily long.<br>
Even so, I'm very thankful to Velan Studios for releasing the private server version of the game and letting us enjoy it beyond the official server shutdown. And I'll definitely be keeping an eye out from the sidelines for any cool new projects they come up with.<br>
<br>
All the code will continue to stay open source and up on GitHub as a public archive even after the shutdown. <br>
You can find all that here: <a onclick="window.launchURL('https://github.com/kocxyz')">https://github.com/kocxyz</a><br>
<br>
Alright, that would be it from me for now then. Thank you to everyone for all the great memories and experiences and may we meet again (Maybe in Knockout City 2 :eyes:, maybeee).`

function NewsMenuElm() {
  const [news, setNews] = useState<Types.NewsArticle[]>([
    {
      title: "Farewell, kocity.xyz",
      time: "2026-11-21T20:41:35.738Z",
      description: farewellpost
    }
  ])

  useEffect(() => {
    // axios
    //   .get('https://chonky.kocity.xyz/api/news/public', {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Cache-Control': 'no-cache'
    //     }
    //   })
    //   .then((res) => {
    //     setNews(
    //       (res.data ?? []).map((item: any) => ({
    //         title: item.title,
    //         time: item.date,
    //         description: item.content
    //       })) as Types.NewsArticle[]
    //     )
    //   })
  }, [])

  return (
    <Box
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        height: '460px',
        maxHeight: '460px',
        overflowY: 'scroll'
      }}
    >
      {(() => {
        if (news.length === 0)
          return <CircularProgress style={{ margin: 'auto', marginTop: '150px' }} />
        else
          return news.map((item, index) => {
            return (
              <NewsArticle
                key={index}
                title={item.title.toUpperCase()}
                date={moment(item.time).fromNow()}
                content={item.description}
              />
            )
          })
      })()}
    </Box>
  )
}

const NewsMenu = memo(
  () => <NewsMenuElm />,
  () => {
    return false
  }
)
export default NewsMenu
