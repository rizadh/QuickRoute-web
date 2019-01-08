export const isValidAddress = (address: string) =>
    /[A-Za-z]+/.test(address)

export const parseAddress = (address: string) =>
    address.replace(/[^A-Za-z0-9\s]/g, "")