import {useMemo} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

/**
 * This hook returns data to be used with short mentions in LiveMarkdown/Composer.
 * Short mentions have the format `@username`, where username is the first part of user's login (email).
 * All the personal data from Onyx is formatted into short-mentions.
 * In addition, currently logged-in user is returned separately since it requires special styling.
 */
export default function useShortMentionsList() {
    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [personalDetailsEmailDomains] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_DETAILS_EMAIL_DOMAINS, {canBeMissing: true});

    const availableLoginsList = useMemo(() => {
        if (!personalDetails) {
            return [];
        }

        // Use entries so we keep the accountID to look up derived loginDomain mapping
        return Object.entries(personalDetails)
            .map(([, personalDetail]) => {
                if (!personalDetail?.login) {
                    return;
                }

                // Compare loginDomain equality using derived mapping for both users.
                // Only highlight when both have a non-empty, equal loginDomain.
                const personalAccountID = String(personalDetail.accountID ?? '');
                const currentAccountID = String(currentUserPersonalDetails.accountID ?? '');

                const personalDomain = personalDetailsEmailDomains?.[personalAccountID]?.loginDomain;
                const currentDomain = personalDetailsEmailDomains?.[currentAccountID]?.loginDomain;

                if (!personalDomain || !currentDomain || personalDomain !== currentDomain) {
                    return;
                }

                const [username] = personalDetail.login.split('@');
                return username;
            })
            .filter((login): login is string => !!login);
    }, [currentUserPersonalDetails.accountID, personalDetails, personalDetailsEmailDomains]);

    // We want to highlight both short and long version of current user login
    const currentUserMentions = useMemo(() => {
        if (!currentUserPersonalDetails.login) {
            return [];
        }

        const [baseName] = currentUserPersonalDetails.login.split('@');
        return [baseName, currentUserPersonalDetails.login];
    }, [currentUserPersonalDetails.login]);

    return {availableLoginsList, currentUserMentions};
}
