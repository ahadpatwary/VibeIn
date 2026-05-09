import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { setToken } from '../utils/config';

interface LoginAnswers {
  token: string;
}

const login = async (): Promise<void> => {
  console.log(chalk.blue.bold('\n--- CloudDecode Login ---'));

  const answers = await inquirer.prompt<LoginAnswers>([
    {
      type: 'input',
      name: 'token',
      message: 'Enter your Personal Access Token (from website):',
      validate: (input: string) => (input.length > 0 ? true : 'Token is required!')
    }
  ]);

  const spinner = ora('Verifying token...').start();

  try {
    // TODO: এপিআই দিয়ে টোকেন ভেরিফাই করার লজিক এখানে হবে
    // const isValid = await api.verify(answers.token);

    setTimeout(() => {
      setToken(answers.token);
      spinner.succeed(chalk.green(' Login successful!'));
    }, 1500);
  } catch (error) {
    spinner.fail(chalk.red(' Invalid token!'));
  }
};

export default login;
