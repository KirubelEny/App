import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import {Str} from 'expensify-common';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import type {PersonalDetailsList} from '@src/types/onyx';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.PERSONAL_DETAILS_EMAIL_DOMAINS,
    dependencies: [ONYXKEYS.PERSONAL_DETAILS_LIST],
    compute: ([_personalDetails]): Record<string, {accountID: string; loginDomain?: string | null}> => {
        const personalDetails = _personalDetails as PersonalDetailsList | undefined;
        if (!personalDetails) {
            return {};
        }

        const domains: Record<string, {accountID: string; loginDomain?: string | null}> = {};
        for (const [accountID, details] of Object.entries(personalDetails)) {
            const login = details?.login ?? '';
            const domain = Str.extractEmailDomain(login || '');
            // If domain is a public domain, skip assigning loginDomain (keep falsy/undefined)
            const loginDomain = domain && !isEmailPublicDomain(login) ? domain.toLowerCase() : undefined;
            domains[accountID] = {accountID, loginDomain};
        }
        return domains;
    },
});
