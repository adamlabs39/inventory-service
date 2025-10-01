const zodErrorParser = (errors) => {
    return errors.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));
};

export default zodErrorParser;