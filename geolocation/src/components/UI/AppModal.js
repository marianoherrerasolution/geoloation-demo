import React, { useEffect } from "react";
import './AppModal.css'
export function AppModal(props) {
  const [showModal, setShowModal] = React.useState('block')
  function closeModal() {
    setShowModal('none');
  }
  return (
    <div className="modal" style={{
        display: showModal
      }}>
      <table style={{
        textAlign: "left"
      }}>
        <tbody>
        {Object.keys(props.loc).map((key, index) => {
          if (key != 'currency' && key != 'time_zone') {
            return (
              <tr key={index}>
                <td>
                  {key}
                </td>
                <td>
                  {props.loc[key] == null? "N/A": props.loc[key]}
                </td>
              </tr>
            );
          }
        })}
        </tbody>
      </table>
      <button className="close_modal" onClick={closeModal}>x</button>
    </div>
  );
}
