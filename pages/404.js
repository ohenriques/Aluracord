import appConfig from '../config.json';

export default function Custom404() {
    return (
        <><div>
            [404 - Page Not Found]
        </div>
            <style jsx>{`
            div{
                font-size: 24px;
                background-image: url(https://www.prestashop.com/sites/default/files/styles/blog_750x320/public/blog/2019/10/banner_error_404.jpg?itok=eAS4swln);
                background-repeat: no-repeat;
                background-color: ${appConfig.theme.colors.primary[500]};
            }
            `}</style></>

    )
}