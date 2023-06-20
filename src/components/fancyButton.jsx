import React from 'react'

function fancyButton(props) {
  return (
    <button className="cta" href={props.href} onClick={props.onClick} id={props.id} key={props.id} style={{
        width: '250px', 
        height: '55px', 
        fontSize: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Brda',
        fontStyle: 'italic',
        lineHeight: '3px',
        letterSpacing: '2px',
        ...props.style
    }}>
        <span style={{
            // color: '#FFF000',
        }}>{props.text}</span>
    </button>
  )
}

export default fancyButton