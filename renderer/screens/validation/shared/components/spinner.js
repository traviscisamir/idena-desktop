import React from 'react'
import theme from '../../../../shared/theme'

function Spinner() {
  return (
    <div>
      <style jsx>{`
        @keyframes donut-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        div {
          display: inline-block;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: ${theme.colors.primary};
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: donut-spin 1.2s linear infinite;

          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
      `}</style>
    </div>
  )
}

export default Spinner
