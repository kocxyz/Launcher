import React from 'react'

function fancyButton(props) {
  return (
    <button className="cta" href={props.href} onClick={props.onClick} style={{
        width: '250px', 
        height: '55px', 
        fontSize: '25px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Roboto',
        ...props.style
    }}>
        <span>{props.text}</span>
    </button>
  )
}

export default fancyButton