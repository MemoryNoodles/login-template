/**
 * @component  Login
 * 登录组件
 * */
import React from "react";
import { Form } from "antd";
import { connect } from "react-redux";
import Api from "~/until/api";
import { QUERY } from "~/constants/const";
import { loginAllocation } from "~/action/loginAllocation";
import RegisterWrapper from "./component/Register";
import NormalLoginForm from "./component/LoginForm";
import ForgetPassWord from "./component/ForgetPassWord";
import { ContainerQuery } from 'react-container-query';//容器媒体查询
import "./login.less";

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

class Login extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            loginVisible: true,
            registVisible: false,
            forgetVisible: false,
            registWay: "",
            curScreen:""
        };
    }
    toLogin() {
        this.setState({
            loginVisible: true,
            registVisible: false,
            forgetVisible: false
        });
    }
    toRegist() {
        this.setState({
            loginVisible: false,
            registVisible: true,
            forgetVisible: false
        });
    }
    toForget() {
        /*this.setState({
            loginVisible: false,
            registVisible: false,
            forgetVisible: true
        });*/
        this.props.history.push("/SecurityCenter");
    }
    componentDidMount() {

        Api.AcquireAllocation().then(res => {
            this.props.dispatch(loginAllocation(res.content));
        });
    }
    static getDerivedStateFromProps = (props,prevState) => {
        const {curScreen} = props

        if(curScreen!==prevState.curScreen){
            return {
                curScreen
            }
        }
       
    };
    render() {
        return (
            <div className={`login-container ${this.state.curScreen !== "big-screen" ?"center-container":""}`}>
                <div
                    className={`components-form-demo-normal-login ${
                        this.state.curScreen === "mobile" ? "small-login center-login" : ""
                    } ${
                        this.state.curScreen === "sm-screen" ? "center-login" : ""
                    }`}
                >
                    <div className="components-form-demo-normal-login-container">
                        {this.state.loginVisible ? (
                            <WrappedNormalLoginForm
                                history={this.props.history}
                                toForget={this.toForget.bind(this)}
                                toRegist={this.toRegist.bind(this)}
                                dispatch={this.props.dispatch}
                            />
                        ) : (
                            ""
                        )}
                        {this.state.registVisible ? (
                            <RegisterWrapper
                                toLogin={this.toLogin.bind(this)}
                            />
                        ) : (
                            ""
                        )}
                        {this.state.forgetVisible ? (
                            <ForgetPassWord toLogin={this.toLogin.bind(this)} />
                        ) : (
                            ""
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const { loginAllocation } = state;
    return { loginAllocation };
};
const LoginWrap = props => {
    return (
        <ContainerQuery query={QUERY}>
            {params => {
                let data=''
                for (let key in params) {
                    if(params[key]){
                        switch (`${key}`) {
                            //若当前窗口是手机
                            case "screen-xs" :
                                data='mobile';
                                break;
                            //若当前窗口是小屏
                            case "screen-md" :
                                data='sm-screen';
                                break;
                            //若当前窗口是大屏
                            case "screen-lg" :
                                data='big-screen';
                                break;
                            default :
                                data=''
                        }
                    }
                }
                //存入当前屏幕尺寸至reducer
                return (
                    <Login {...props} curScreen={data}/>
                )
            }}
        </ContainerQuery>
    );
};
export default connect(mapStateToProps)(LoginWrap);
