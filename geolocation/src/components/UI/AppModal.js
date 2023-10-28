import React, { useEffect } from "react";
import Modal from 'react-modal';
import ModalStyle  from './AppModal.css'
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};
Modal.setAppElement('body');
export function AppModal(props) {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  let subtitle;
  function openModal() {
    setIsOpen(true);
  }
  function afterOpenModal() {
    subtitle.style.color = '#f00';
  }
  
  function closeModal() {
    setIsOpen(false);
  }
    useEffect(() => {
    openModal();
  }, []);
  return (
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2 ref={(_subtitle) => (subtitle = _subtitle)}></h2>
        <div>
          {Object.keys(props.loc).map((key, index) => {
            return (
              <div key={index}>
                <p>
                  {key}: {props.loc[key]}
                </p>

                <hr />
              </div>
            );
          })}
        </div>
        <button className="close_modal" onClick={closeModal}>x</button>
      </Modal>
  );
}
