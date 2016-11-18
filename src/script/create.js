import { User, Share } from '../models';

User.sync({})
  .then(() => Share.sync())
  .done(() => process.exit(0));
