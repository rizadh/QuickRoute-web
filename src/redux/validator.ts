export const isValidAddress = (address: string) => {
    return /[A-Za-z]+/.test(address)
}

export const parseAddress = (address: string) => {
    return address.replace(/[^A-Za-z0-9\s]/g, "")
}