import { honeConfig } from '../config/main'
import { useRouter } from 'vue-router'
import { slugify } from '@/utils/textFormat'
const router = useRouter()




export const openLink = (url: string) => {
    // 存在链接时，才会跳转
    if (url) {
        window.open(url, '_blank')
    } return
}


export const openLinkByRouter = (url: string) => {
    if (url) {
        router.push({
            name: 'post',
            params: {
                slug: slugify(url)
            }
        })
    }
}



