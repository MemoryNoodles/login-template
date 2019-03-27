import React from "react";
import {connect} from "react-redux";
import {fetchPostsIfNeeded} from "~/action/login";
import {breadcrumbTopText} from "~/action/breadcrumbTopText";
import Api from "~/until/api";
import {isEmpty} from "~/until/common";
import * as Message from "~/components/common/message";
import {Form, Icon, Input, Button, Row, Checkbox} from "antd";

const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            imgSrc: "",
            rememberMe: "",
            rememberMeValue: false,
            registWay: "",
            captcha: ""
        };
        this.registType = "";
    }

    componentDidMount = () => {
        //请求验证码
        this.getLoginCaptcha();
        
        if (!isEmpty(this.props.loginAllocation)) {
            const registWay = this.props.loginAllocation.loginWay;
            const rememberMe = this.props.loginAllocation.rememberMe;
            const captcha = this.props.loginAllocation.captcha;
            this.setState({registWay, rememberMe, captcha});
            let registWayArray = registWay.split("_");
            if (registWayArray.indexOf("account") >= 0) {
                this.registType = "用户名";
            }
            if (registWayArray.indexOf("phone") >= 0) {
                this.registType = this.registType + (this.registType ? "/电话号码" : "电话号码");
            }
            if (registWayArray.indexOf("email") >= 0) {
                this.registType = this.registType + (this.registType ? "/邮箱" : "邮箱");
            }
        }

        let rememberMeInfo = JSON.parse(localStorage.getItem("rememberMeInfo"));
        if (rememberMeInfo) {
            this.setState({
                rememberMeValue: true,
            });
            this.props.form.setFieldsValue(rememberMeInfo);
        }
    }

    componentDidUpdate = (preProps) => {
        if (this.props.loginAllocation !== preProps.loginAllocation) {
            
            const registWay = this.props.loginAllocation.loginWay;
            const rememberMe = this.props.loginAllocation.rememberMe;
            const captcha = this.props.loginAllocation.captcha;

            let registWayArray = registWay.split("_");
            if (registWayArray.indexOf("account") >= 0) {
                this.registType = "用户名";
            }
            if (registWayArray.indexOf("phone") >= 0) {
                this.registType = this.registType + (this.registType ? "/电话号码" : "电话号码");
            }
            if (registWayArray.indexOf("email") >= 0) {
                this.registType = this.registType + (this.registType ? "/邮箱" : "邮箱");
            }
            this.setState({
                registWay, rememberMe, captcha
            },()=>{
                this.getLoginCaptcha();
            })
        }
    }

    getLoginCaptcha = () => {
        /*判断是否需要验证码*/
        if (this.state.captcha === "yes") {
            Api.getLoginCaptcha().then(blob => {
                let url = URL.createObjectURL(blob);
                this.setState({
                    imgSrc: url
                });
            });
        }
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {dispatch} = this.props;
                dispatch(fetchPostsIfNeeded({...values, rememberMe: this.state.rememberMeValue ? 1 : 0}))
                    .then(res => {/*登录成功*/
                        //是否强制修改密码
                        if (res.content.modifyPassword === "yes") {
                            Message.info("您本次为首次登录，为了您的账户安全，请修改密码！", 10)
                            sessionStorage.setItem("modifyPassword", "yes");
                        } else {
                            sessionStorage.setItem("modifyPassword", "no");
                        }
                        //是否记住我的账号密码
                        let loginMessage = {
                            usercode: values.usercode,
                            passwd: values.passwd,
                        };
                        if (this.state.rememberMeValue) {
                            localStorage.setItem("rememberMeInfo", JSON.stringify(loginMessage));
                        } else {
                            localStorage.removeItem("rememberMeInfo");
                        }
                        this.props.dispatch(breadcrumbTopText(["首页"]));
                        this.props.history.push("/Dashboard/FirstMenus/index");
                    })
                    .catch(err => {
                        this.getLoginCaptcha();
                        this.props.form.setFieldsValue({kaptchald: ""});
                        if (err.message.indexOf("验证码") > -1) {
                            this.props.form.setFields({
                                captchald: {
                                    value: "",
                                    errors: [new Error(err.message)]
                                }
                            });
                        }
                        else if (err.message.indexOf("密码") > -1) {
                            this.props.form.setFields({
                                passwd: {
                                    value: values.passwd,
                                    errors: [new Error(err.message)]
                                }
                            });
                        }
                        else {
                            this.props.form.setFields({
                                usercode: {
                                    value: values.usercode,
                                    errors: [new Error(err.message)]
                                }
                            });
                        }
                    });
            }
        });
    };

    rememberMe = (e) => {
        this.setState({
            rememberMeValue: e.target.checked,
        });
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Row className="login-box">
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                        {getFieldDecorator("usercode", {
                            rules: [{required: true, message: `请输入${this.registType}`}]
                        })(
                            <Input
                                prefix={
                                    <Icon type="user" style={{color: "rgba(0,0,0,.25)"}}/>
                                }
                                placeholder={this.registType ? `请输入${this.registType}` : "请输入用户名/邮箱/电话号码"}
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator("passwd", {
                            rules: [{required: true, message: "请输入密码"}]
                        })(
                            <Input
                                prefix={
                                    <Icon type="lock" style={{color: "rgba(0,0,0,.25)"}}/>
                                }
                                type="password"
                                placeholder="请输入密码"
                            />
                        )}
                    </FormItem>
                    {this.state.captcha === "yes" ? <FormItem>
                        <div className='kaptchald-div'>
                            <div className='kaptchald-div-input'>
                                {getFieldDecorator("captchald", {
                                    rules: [{required: true, message: "请输入验证码"}]
                                })(
                                    <Input
                                        placeholder="点击图片可刷新验证码"
                                        prefix={
                                            <Icon
                                                type="safety-certificate"
                                                style={{color: "rgba(0,0,0,.25)", fontSize: 16}}
                                            />
                                        }
                                    />
                                )}
                            </div>
                            <div className='kaptchald-div-img'>
                                <img
                                    style={{cursor: "pointer"}}
                                    title="点击更换"
                                    src={this.state.imgSrc}
                                    onClick={() => this.getLoginCaptcha()}
                                />
                            </div>
                        </div>
                    </FormItem> : ""}
                    <FormItem className="button-bottom">
                        <Row type="flex" justify="end">
                            <div>
                                {this.state.rememberMe === "yes" ? (
                                    <Checkbox onChange={(e) => this.rememberMe(e)}
                                              checked={this.state.rememberMeValue}>记住我</Checkbox>
                                ) : (
                                    ""
                                )}
                                <a onClick={() => this.props.toForget()}>忘记密码？</a>
                            </div>
                            {/*<div onClick={() => this.props.toRegist()} className="reg-button">立即注册</div>*/}
                        </Row>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                        >
                            登录
                        </Button>
                    </FormItem>
                </Form>
            </Row>
        );
    }
}

const mapStateToProps = state => {
    const {loginAllocation} = state;
    return {loginAllocation};
};
export default connect(mapStateToProps)(NormalLoginForm);
