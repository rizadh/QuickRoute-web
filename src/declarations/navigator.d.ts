// TODO: Replace once React DOM declaration files are updated to include navigator.share
type ShareData = { title?: string; text?: string; url?: string }
interface INavigator extends Navigator {
    share: (data: ShareData) => Promise<undefined>
}
