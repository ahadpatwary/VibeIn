import { Router, RouterOptions } from 'express';

const routerOptions: RouterOptions = {
    caseSensitive: true,
    strict: true,
};

const router: Router = Router(routerOptions);

//__________________________ route config  ____________________________

router.get('/id');

export default router;
