import { Box, Text, TextField, Image, Button, GridDisplay } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { Icon } from '@skynexui/components';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';
const REACT_APP_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMzMDk3MSwiZXhwIjoxOTU4OTA2OTcxfQ.O966G0PcuxAGuJMKuM_wUI7cvywX0RqUOOUdQO-ltRs';
const REACT_APP_SUPABASE_URL = 'https://vzdpqtqrbvqovbmawmzp.supabase.co'
const supabaseClient = createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
        .from('mensagens')
        .on('INSERT', (respostaLive) => {
            adicionaMensagem(respostaLive.new);
        })
        .subscribe();
}

export default function ChatPage() {
    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;
    // console.log('Usuario Logado =>', usuarioLogado);
    // console.log('Roteamento =>', roteamento);
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagem, setListaDeMensagens] = React.useState([]);

    React.useEffect(() => {
        supabaseClient
            .from('mensagens')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                // console.log('Dados da consulta:', data);
                setListaDeMensagens(data);
            });

        const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
            console.log('Nova mensagem:', novaMensagem);
            console.log('listaDeMensagem:', listaDeMensagem);
            // Quero reusar um valor de referencia (objeto/array) 
            // Passar uma função pro setState

            // setListaDeMensagens([
            //     novaMensagem,
            //     ...listaDeMensagem
            // ])
            setListaDeMensagens((valorAtualDaLista) => {
                console.log('valorAtualDaLista:', valorAtualDaLista);
                return [
                    novaMensagem,
                    ...valorAtualDaLista,
                ]
            });
        });

      
        return () => {
            subscription.unsubscribe();
        }
    }, []);

    /*
    {
    // Usuario 
     
     - digita um texto no text area
     - aperta enter e envia
     - adicionar o text em uma listagem
    
    // DEV

    - [x] Campo Criado
    - [x] Vamos usar o onChange e o useState(ter um if caso seja enter para limpar a variável)
    - [x] Lista as mensagens

     }*/
    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            de: usuarioLogado,
            texto: novaMensagem,
        }

        supabaseClient
            .from('mensagens')
            .insert([
                // Tem que ser um objeto com os MESMOS CAMPOS que você escreveu no supabase
                mensagem
            ])
            .then(({ data }) => {
                console.log('Criando mensagem', data);
            })
        // chamada do backend
        setMensagem('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: appConfig.backgroundImage,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    // boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    boxShadow: 'inset 0 0 1em red, 0 0 1em red',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.transparents[700],
                    // backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        // backgroundColor: appConfig.theme.colors.neutrals[600],
                        backgroundColor: appConfig.theme.colors.transparents[700],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}

                >

                    {<MessageList mensagens={listaDeMensagem} />}
                    {/* ta mudando o valor: {mensagem} */}
                    {/* {listaDeMensagem.map((mensagemAtual) => {
                        return (
                        <li key={mensagemAtual.id}>
                            {mensagemAtual.de}: {mensagemAtual.texto}
                        </li>
                    )})} */}
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            //enviar mensagem quando apertar a tecla Enter
                            value={mensagem}
                            placeholder="Mensagem"
                            type="textarea"
                            onChange={(event) => {
                                // console.log('mensagem:', event.target.value);
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />


                        {/* CallBack  */}
                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                                //console.log('[USANDO O COMPONENTE] Salvando esse sticker no banco: ', sticker);
                                handleNovaMensagem(':sticker: ' + sticker);
                            }} />

                        <Button iconName="arrowRight"
                            // Enviar menagem através do botão
                            value={mensagem}
                            onClick={(event) => {
                                if (event.type === 'click') {
                                    if (!mensagem == '') {
                                        handleNovaMensagem(mensagem);
                                    }
                                }
                            }}
                            styleSheet={{
                                borderRadius: '50%',
                                padding: '0 3px 0 0',
                                minWidth: '50px',
                                minHeight: '50px',
                                fontSize: '40px',
                                marginBottom: '8px',
                                lineHeight: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: appConfig.theme.colors.primary[970],
                                mainColorStrong: appConfig.theme.colors.primary[970],
                                hover: {
                                    filter: 'grayscale(0)',
                                    backgroundColor: appConfig.theme.colors.primary[980],
                                }

                            }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    // console.log(props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                    hover: {
                                        filter: 'grayscale(0)',
                                        backgroundColor: appConfig.theme.colors.primary[980],
                                        borderRadius: '10%',
                                    }
                                }}
                                src={`https://github.com/${mensagem.de}.png`}

                            />


                            <Text tag="strong">
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {/* <Button
                            colorVariant="positive"
                            iconName="arrowRight"
                            label=""
                            onClick={(event) => {
                                // // console.log(event);
                            }}
                        /> */}
                        {/* [Declarativo] */}
                        {/* Condicional: {mensagem.texto.startsWith(':sticker:').toString()} */}
                        {mensagem.texto.startsWith(':sticker:')
                            ? (
                                <Image src={mensagem.texto.replace(':sticker:', '')} />
                            )
                            : (
                                mensagem.texto
                            )}
                        {/* if mensagem de texto possui stickers:
                           mostra a imagem
                        else 
                           mensagem.texto */}
                        {/* {mensagem.texto} */}
                    </Text>
                );
            })}
        </Box>
    )
}
