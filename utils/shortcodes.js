export const icon = (name) => {
    return `<svg class="icon icon--${name}" role="img" aria-hidden="true" width="24" height="24">
                <use xlink:href="#icon-${name}"></use>
            </svg>`;
};

// Export par défaut pour permettre l'importation par défaut
export default {
    icon,
};
