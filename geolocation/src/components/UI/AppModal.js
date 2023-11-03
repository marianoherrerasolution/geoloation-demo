import React, { useEffect } from "react";
// import Modal from 'react-modal';
import ModalStyle  from './AppModal.css'
// const customStyles = {
//   content: {
//     top: '50%',
//     left: '50%',
//     right: 'auto',
//     bottom: 'auto',
//     marginRight: '-50%',
//     transform: 'translate(-50%, -50%)',
//   },
// };
// Modal.setAppElement('body');
export function AppModal(props) {
  // console.log(props.loc);
  // const [modalIsOpen, setIsOpen] = React.useState(false);
  // let subtitle;
  // function openModal() {
  //   setIsOpen(true);
  // }
  // function afterOpenModal() {
  //   subtitle.style.color = '#f00';
  // }
  
  // function closeModal() {
  //   setIsOpen(false);
  // }
    // useEffect(() => {
    // openModal();
  // }, []);
  return (
      <div className="modal"
        // isOpen={modalIsOpen}
        // onAfterOpen={afterOpenModal}
        // onRequestClose={closeModal}
        // style={customStyles}
        // contentLabel="Example Modal"
      >
        {/* <h2>Modal</h2> */}
        <table style={{
          textAlign: "left"
        }}>
          {Object.keys(props.loc).map((key, index) => {
            if (key!='currency' && key != 'time_zone') {
              return (
                <tr>
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
        </table>
        <button className="close_modal">x</button>
      </div>
  );
}
