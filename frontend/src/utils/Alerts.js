import Swal from 'sweetalert2';

export const showAlert = ({ title, text, icon, confirmButtonText = 'OK', showCancelButton = false, cancelButtonText = 'Cancelar' }) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: confirmButtonText,
        showCancelButton: showCancelButton,
        cancelButtonText: cancelButtonText,
        customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    });
}

export const showSuccessAlert = (text) => {
    return showAlert({
        title: '¡Éxito!',
        text: text,
        icon: 'success'
    });
}

export const showErrorAlert = (text) => {
    return showAlert({
        title: '¡Error!',
        text: text,
        icon: 'error'
    });
}

export const showWarningAlert = (text) => {
    return showAlert({
        title: 'Advertencia',
        text: text,
        icon: 'warning'
    });
}

export const showConfirmationAlert = (text, confirmButtonText = 'Confirmar') => {
  return Swal.fire({
    title: 'Confirmación',
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3085d6',  
    cancelButtonColor: '#d33',      
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel'
    },
    buttonsStyling: true,           
    reverseButtons: true            
  });
};

export const showInputAlert = async ({ 
  title, 
  inputLabel, 
  inputPlaceholder, 
  confirmButtonText = 'Confirmar' 
}) => {
  const { value: inputValue, isConfirmed } = await Swal.fire({
    title,
    input: 'text',
    inputLabel,
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonColor: '#e53935',
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) return 'Este campo no puede estar vacío';
    }
  });

  return { inputValue, isConfirmed };
};
