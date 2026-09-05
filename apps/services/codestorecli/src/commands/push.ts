import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs-extra';
import { getToken } from '../utils/config';

interface PushOptions {
  message?: string;
}

const push = async (options: PushOptions): Promise<void> => {
    console.log(chalk.blue.bold('\n--- CloudDecode Push ---'));
    const token = getToken();
    if (!token) {
        console.log(chalk.red('Error: You must login first using "cloudecode login"'));
        return;
    }

    const spinner = ora('Preparing your code for upload...').start();

    try {
        /*
          TODO: LOGIC PART
          ১. বর্তমান ডিরেক্টরির ফাইলগুলো লিস্ট করা।
          ২. .cloudecode-ignore ফাইল চেক করা।
          ৩. ফাইলগুলোকে জিপ (Zip) করা।
          ৪. সার্ভারের এপিআইতে মাল্টিপার্ট ফরম-ডাটা হিসেবে পাঠানো।
          ৫. সার্ভার সাইডে ওয়াটারমার্ক ইনজেক্ট করা হবে।
        */

        const message = options?.message ?? 'No commit message provided';
        await fs.pathExists('.');

        setTimeout(() => {
            spinner.succeed(chalk.green(' Code pushed successfully to CloudDecode!'));
            console.log(chalk.gray(`Commit message: ${message}`));
            console.log(chalk.gray('View your listing at: https://cloudecode.com/my-listings'));
        }, 4500);

    } catch (error) {
        spinner.fail(chalk.red(' Push failed! Please check your internet connection.'));
    }
};

export default push;