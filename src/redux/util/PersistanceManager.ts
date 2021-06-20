class PersistanceManager {
    private static ADDRESSES_STORAGE_KEY = 'addresses'

    private initialAddreses: string[] | null = PersistanceManager.retrieveAddresses()
    private addresses: string[] | null = null

    private static retrieveAddresses() {
        const storageValue = localStorage.getItem(PersistanceManager.ADDRESSES_STORAGE_KEY)
        return storageValue && JSON.parse(storageValue)
    }

    constructor() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') this.persistAddresses()
        })
    }

    getAddresses(): string[] | null {
        return this.initialAddreses
    }

    setAddresses(addresses: string[]) {
        this.addresses = addresses
    }

    private persistAddresses() {
        if (!this.addresses || this.addresses.length === 0) return
        const storageValue = JSON.stringify(this.addresses)
        localStorage.setItem(PersistanceManager.ADDRESSES_STORAGE_KEY, storageValue)
    }
}

export default new PersistanceManager()
