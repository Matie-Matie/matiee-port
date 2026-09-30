import type { Project } from '../types';

/**
 * Project money rollup. These formulas are carried over verbatim from the
 * original dashboard so every number stays identical after the redesign.
 */
export function projectFinance(projects: Project[]) {
  // Revenue = what's actually been paid (toggle-based, no double counting)
  const totalRevenue = projects.reduce((sum, p) => {
    let rev = 0;
    if (p.downpaymentPaid) rev += p.downpayment;
    if (p.remainingPaid) rev += p.fee - p.downpayment;
    return sum + rev;
  }, 0);

  // Outstanding = still unpaid across projects
  const outstanding = projects
    .filter((p) => !p.remainingPaid)
    .reduce((sum, p) => sum + (p.fee - (p.downpaymentPaid ? p.downpayment : 0)), 0);

  const downpaymentsCollected = projects
    .filter((p) => p.downpayment > 0 && p.downpaymentPaid)
    .reduce((sum, p) => sum + p.downpayment, 0);

  const pipelineValue = projects.reduce((sum, p) => sum + p.fee, 0);

  return { totalRevenue, outstanding, downpaymentsCollected, pipelineValue };
}
