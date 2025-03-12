const receberNotificacao = async (req, res) => {
    try {
      const notification = req.body;

      console.log('Notificação recebida:', notification);

      res.status(200).send('Notificação recebida com sucesso');
    } catch (error) {
      console.error('Erro ao processar a notificação:', error);
      res.status(500).send('Erro ao processar a notificação');
    }
  };
  
  module.exports = { receberNotificacao };
  