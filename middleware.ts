import { Request, Response } from 'express';

export const middleware = (req: Request, res: Response) => {
  // Suppress logs in production
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
    console.error = () => {};
  }

  // Redirect `/debug` route in production
  if (process.env.NODE_ENV === 'production' && req.path === '/debug') {
    return res.redirect('/');
  }

  // Handle 404 errors
  if (req.path === '/404') {
    if (process.env.NODE_ENV === 'production') {
      return res.redirect('/');
    }
    return res.status(404).send('Page not found');
  }
};
