import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    
    if (!header) {
        return res.status(401).json({ message: "Faça o login." });
    }

    const [scheme, token] = header.split(" ");
    
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Formato de token inválido." });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_JWT);
        
        req.user = decoded; 
        
        next();
    } catch (e) {
        return res.status(401).json({ message: "Token inválido ou vencido." });
    }
}

export const authorizaAdmin = (req, res, next) => {
    const user = req.user; 

    if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Somente Administradores." });
    }
    
    next(); 
}