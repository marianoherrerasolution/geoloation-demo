export const fieldToLabel = (field: string) => {
  switch(field) {
    case "fName":
      return "first name";
    case "lName":
      return "last name";
    default:
      return field;
  }
}

interface ErrorProps {
  error?: string;
  field?: string;
}

export const errorCallback = ({error, field}:ErrorProps, setAlert?:any) => {
  switch (error) {
    case "exist":
      setAlert(`The ${field} is already taken`)
      break;
    case "empty":
      setAlert(`The ${fieldToLabel(field || "field")} should be filled.`)
      break;
    case "invalid":
      setAlert(`The ${fieldToLabel(field || "field")} is invalid.`)
      break;
    case "not_found":
      setAlert(`The account is not exist.`)
      break;
    case "internal_server":
      setAlert(`Sorry, there's internal error`)
      break;
    default:
      setAlert(`${error}`)
  }
}